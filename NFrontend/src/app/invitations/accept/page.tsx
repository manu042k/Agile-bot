"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle, XCircle, Mail, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import teamService from "@/services/teamService";
import userInfoService from "@/services/userInfoService";
import authService from "@/services/authService";
import toast from "react-hot-toast";
import Link from "next/link";
import { signIn } from "next-auth/react";

const AcceptInvitationPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "syncing" | "checking" | "login_required" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [teamId, setTeamId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState("");
  const hasProcessedRef = useRef(false);

  // Wait for Django sync to complete
  const waitForDjangoSync = useCallback(async (maxWaitTime: number = 15000, checkInterval: number = 1000): Promise<boolean> => {
    const startTime = Date.now();
    let attemptCount = 0;
    
    while (Date.now() - startTime < maxWaitTime) {
      attemptCount++;
      try {
        // Try to fetch user info - if successful, Django sync is complete
        const userInfo = await userInfoService.getUserInfo();
        console.log(`[Invitation] Django sync confirmed (attempt ${attemptCount}) - user exists in Django:`, userInfo.email);
        return true;
      } catch (error: any) {
        // If 401, user doesn't exist yet or session not established
        if (error.response?.status === 401 || error.response?.status === 403) {
          const elapsed = Date.now() - startTime;
          console.log(`[Invitation] Waiting for Django sync... (attempt ${attemptCount}, ${elapsed}ms elapsed)`);
          await new Promise(resolve => setTimeout(resolve, checkInterval));
          continue;
        }
        // Network errors - retry
        if (!error.response) {
          console.warn(`[Invitation] Network error checking Django sync (attempt ${attemptCount}):`, error.message);
          await new Promise(resolve => setTimeout(resolve, checkInterval));
          continue;
        }
        // Other errors might be network issues, but we'll try anyway
        console.warn("[Invitation] Error checking Django sync:", error);
        break;
      }
    }
    
    console.warn(`[Invitation] Django sync timeout after ${attemptCount} attempts`);
    return false;
  }, []);

  // Ensure Django sync is complete before accepting
  const ensureDjangoSync = useCallback(async (): Promise<boolean> => {
    if (!session?.user) {
      return false;
    }

    const googleId = (session.user as any).id;
    const email = session.user.email;

    if (!googleId || !email) {
      console.error("[Invitation] Missing googleId or email in session");
      return false;
    }

    // First, try to sync with Django
    try {
      console.log("[Invitation] Ensuring Django sync...");
      await authService.syncWithDjango(googleId, email);
      console.log("[Invitation] Django sync initiated");
    } catch (error) {
      console.error("[Invitation] Failed to sync with Django:", error);
      // Continue anyway - might already be synced
    }

    // Wait for sync to complete (user to exist in Django)
    const syncComplete = await waitForDjangoSync(15000, 1000);
    
    if (!syncComplete) {
      console.warn("[Invitation] Django sync timeout - but user might still be syncing");
      // Give it one more second and try one more time
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        await userInfoService.getUserInfo();
        console.log("[Invitation] Django sync confirmed on final check");
        return true;
      } catch (error) {
        console.error("[Invitation] Django sync still not complete, but proceeding anyway");
        // Proceed anyway - the API call might still work if session is established
      }
    }

    return true;
  }, [session, waitForDjangoSync]);

  const acceptInvitation = useCallback(async (retryCount: number = 0) => {
    if (!token) {
      setStatus("error");
      setMessage("No invitation token provided.");
      return;
    }

    if (hasProcessedRef.current && retryCount === 0) {
      return; // Prevent duplicate calls (unless retrying)
    }

    setStatus(retryCount === 0 ? "syncing" : "checking");
    
    try {
      // Ensure Django sync is complete before accepting
      if (retryCount === 0) {
        console.log("[Invitation] Step 1: Ensuring Django sync...");
        const syncSuccess = await ensureDjangoSync();
        if (!syncSuccess) {
          throw new Error("Failed to sync with Django backend");
        }
        console.log("[Invitation] Step 2: Django sync complete");
      }

      setStatus("checking");
      console.log("[Invitation] Step 3: Calling accept invitation API...");
      
      const response = await teamService.acceptInvitation(token);
      console.log("[Invitation] Step 4: API response:", response);
      
      // Check if response has team_id and team_name (success case)
      if (response.team_id && response.team_name) {
        setStatus("success");
        setMessage(response.detail || "Invitation accepted successfully!");
        setTeamId(response.team_id);
        setTeamName(response.team_name);
        hasProcessedRef.current = true;
        
        toast.success("Invitation accepted successfully! You've been added to the team.");
        
        // Redirect to team page after 2 seconds, with refresh to ensure teams list is updated
        setTimeout(() => {
          router.push(`/teams/${response.team_id}`);
          // Force a refresh to ensure the team appears in the list
          router.refresh();
        }, 2000);
      } else {
        // Response doesn't have expected format, but might still be success
        setStatus("success");
        setMessage(response.detail || "Invitation processed successfully!");
        hasProcessedRef.current = true;
        toast.success(response.detail || "Invitation processed successfully!");
        
        setTimeout(() => {
          router.push("/teams");
          router.refresh();
        }, 2000);
      }
    } catch (err: any) {
      console.error("[Invitation] Error accepting invitation:", err);
      console.error("[Invitation] Error response:", err.response?.data);
      console.error("[Invitation] Error status:", err.response?.status);
      
      const errorMessage = err.response?.data?.detail || err.message || "Failed to accept invitation.";
      
      // If 401 (unauthorized) and we haven't retried, wait and retry
      if (err.response?.status === 401 && retryCount < 3) {
        console.log(`[Invitation] Retry ${retryCount + 1}/3 - 401 error, waiting for Django session...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1))); // Exponential backoff
        await ensureDjangoSync();
        return acceptInvitation(retryCount + 1);
      }
      
      // If 403 (forbidden - email mismatch) and we haven't retried, wait and retry once
      if (err.response?.status === 403 && retryCount < 2 && !errorMessage.includes("different email")) {
        console.log(`[Invitation] Retry ${retryCount + 1}/2 - 403 error, waiting...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        await ensureDjangoSync();
        return acceptInvitation(retryCount + 1);
      }

      hasProcessedRef.current = false; // Allow manual retry on error
      setStatus("error");
      setMessage(errorMessage);
      
      // If error is about email mismatch, suggest logging in with correct account
      if (err.response?.status === 403 && errorMessage.includes("different email")) {
        toast.error("Please log in with the email address that received the invitation.");
      } else if (err.response?.status === 401) {
        toast.error("Authentication failed. Please try logging in again.");
      } else {
        toast.error(errorMessage);
      }
    }
  }, [token, router, ensureDjangoSync]);

  // Check authentication status first
  useEffect(() => {
    if (sessionStatus === "loading") {
      setStatus("loading");
      return;
    }

    if (sessionStatus === "unauthenticated") {
      // User is not logged in, redirect to login
      if (token) {
        setStatus("login_required");
        const loginUrl = `/login?callbackUrl=${encodeURIComponent(`/invitations/accept?token=${token}`)}`;
        router.push(loginUrl);
      } else {
        setStatus("error");
        setMessage("No invitation token provided.");
      }
      return;
    }

    // User is authenticated, proceed with accepting invitation
    if (sessionStatus === "authenticated" && token && !hasProcessedRef.current) {
      acceptInvitation();
    }
  }, [sessionStatus, token, router, acceptInvitation]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full pm-card p-8 text-center">
        {(status === "loading" || status === "syncing" || status === "checking") && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-gray-900 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {status === "loading" 
                ? "Loading..." 
                : status === "syncing"
                ? "Setting up your account..."
                : "Processing Invitation"}
            </h1>
            <p className="text-gray-600">
              {status === "loading" 
                ? "Please wait..." 
                : status === "syncing"
                ? "Please wait while we sync your account..."
                : "Accepting your invitation..."}
            </p>
          </>
        )}

        {status === "login_required" && (
          <>
            <LogIn className="h-12 w-12 text-gray-900 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
            <p className="text-gray-600 mb-6">
              Please log in to accept this team invitation.
            </p>
            <Button
              className="pm-button-primary w-full"
              onClick={() => {
                const loginUrl = `/login?callbackUrl=${encodeURIComponent(`/invitations/accept?token=${token}`)}`;
                router.push(loginUrl);
              }}
            >
              Go to Login
            </Button>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Accepted!</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            {teamName && (
              <p className="text-sm text-gray-500 mb-6">
                You've been added to <strong className="text-gray-900">{teamName}</strong>
              </p>
            )}
            {teamId ? (
              <Link href={`/teams/${teamId}`}>
                <Button className="pm-button-primary w-full">
                  Go to Team
                </Button>
              </Link>
            ) : (
              <Link href="/teams">
                <Button className="pm-button-primary w-full">
                  View All Teams
                </Button>
              </Link>
            )}
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Error</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-2">
              {message.includes("different email") && (
                <Button
                  className="pm-button-primary w-full"
                  onClick={() => {
                    signIn("google", {
                      callbackUrl: `/invitations/accept?token=${token}`,
                    });
                  }}
                >
                  Login with Different Account
                </Button>
              )}
              <Link href="/teams">
                <Button variant="outline" className="w-full">
                  Go to Teams
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Go to Home
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitationPage;

