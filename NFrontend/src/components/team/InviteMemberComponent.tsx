"use client";
import { useState, useEffect, useRef } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, CheckCircle, Loader2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import teamService from "@/services/teamService";

interface InviteMemberComponentProps {
  teamId: string | number;
  onSuccess?: () => void;
  onMemberInvited?: () => void;
}

const InviteMemberComponent: React.FC<InviteMemberComponentProps> = ({
  teamId,
  onSuccess,
  onMemberInvited,
}) => {
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("member");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState<string>("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log("[InviteMemberComponent] Sending invitation:", {
        teamId,
        email,
        role,
      });
      // Use invitation endpoint instead of direct add
      const result = await teamService.inviteMember(
        parseInt(teamId),
        email,
        role as any
      );
      console.log(
        "[InviteMemberComponent] Invitation sent successfully:",
        result
      );

      const emailToShow = email; // Store email before reset

      // Reset form
      setEmail("");
      setRole("member");

      // Show success state
      setInvitedEmail(emailToShow);
      setIsSuccess(true);
      toast.success(`Invitation sent to ${emailToShow}!`);

      // Call success callbacks
      onSuccess?.();
      onMemberInvited?.();

      // Close modal after 1.5 seconds
      setTimeout(() => {
        setIsSuccess(false);
        // Trigger close button click to close dialog
        closeButtonRef.current?.click();
      }, 1500);
    } catch (err: any) {
      console.error("[InviteMemberComponent] Error sending invitation:", err);
      console.error(
        "[InviteMemberComponent] Error response:",
        err.response?.data
      );
      console.error(
        "[InviteMemberComponent] Error status:",
        err.response?.status
      );
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Failed to send invitation. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[520px] bg-white">
      {/* Hidden close button ref for programmatic closing */}
      <DialogClose ref={closeButtonRef} className="hidden" />

      {isSuccess ? (
        // Success State
        <div className="py-8 px-2">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Invitation Sent!
              </h3>
              <p className="text-sm text-gray-600">
                An invitation email has been sent to{" "}
                <span className="font-medium text-gray-900">
                  {invitedEmail}
                </span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Form State
        <>
          <DialogHeader className="pb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <UserPlus className="h-5 w-5 text-gray-700" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-semibold text-gray-900 leading-tight">
                  Invite Team Member
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1.5">
                  Send an invitation via email to join this team
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleInvite} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="member-email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                <Input
                  id="member-email"
                  type="email"
                  placeholder="colleague@example.com"
                  className="pm-input h-11"
                  style={{ paddingLeft: "2.75rem", paddingRight: "0.75rem" }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="member-role"
                className="text-sm font-medium text-gray-700"
              >
                Role
              </Label>
              <Select value={role} onValueChange={setRole} disabled={isLoading}>
                <SelectTrigger id="member-role" className="pm-input h-11">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1.5">
                Members can view and edit tasks. Admins can manage members.
                Owners have full control.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="pm-button-primary w-full sm:w-auto"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </>
      )}
    </DialogContent>
  );
};

export default InviteMemberComponent;
