"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BarChart2, LogOut, Mail, Phone, Calendar, Settings, User, Activity, Bell, Shield, UserCircle, ExternalLink, Lock, KeyRound, FolderKanban, CheckCircle2, Users } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import PageHeader from "@/components/common/PageHeader";
import { useUser } from "@/hooks/useUser";
import { useMemo, useState, useEffect } from "react";
import StatCard from "@/components/common/StatCard";

const ProfilePage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "personal";
  const { data: session, status: sessionStatus } = useSession();
  const { user: backendUser, loading: userLoading } = useUser();
  const [deviceInfo, setDeviceInfo] = useState<string>("Loading...");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = navigator.userAgent;
      if (userAgent.includes("Mac")) {
        setDeviceInfo("macOS");
      } else if (userAgent.includes("Windows")) {
        setDeviceInfo("Windows");
      } else if (userAgent.includes("Linux")) {
        setDeviceInfo("Linux");
      } else {
        setDeviceInfo("Unknown OS");
      }
    }
  }, []);

  // Parse Google name into first_name and last_name
  const parseName = (fullName: string | null | undefined) => {
    if (!fullName) return { first_name: "", last_name: "" };
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return { first_name: parts[0], last_name: "" };
    }
    const last_name = parts.pop() || "";
    const first_name = parts.join(" ");
    return { first_name, last_name };
  };

  // Combine NextAuth session data (from Google) with backend user data
  const user = useMemo(() => {
    if (sessionStatus === "loading" || userLoading) {
      return null;
    }

    if (!session?.user) {
      return null;
    }

    const { first_name, last_name } = parseName(session.user.name);
    const fullName = session.user.name || "";
    
    return {
      id: session.user.id || backendUser?.id || "",
      first_name,
      last_name,
      full_name: fullName,
      email: session.user.email || backendUser?.email || "",
      phone_number: backendUser?.phone_number || "",
      is_active: backendUser?.is_active ?? true,
      profile_pic: session.user.image || backendUser?.avatar_url || backendUser?.profile_pic || null,
      joined_date: backendUser?.date_joined 
        ? new Date(backendUser.date_joined).toLocaleDateString()
        : "",
      role: "User" // Default role, can be enhanced later
    };
  }, [session, sessionStatus, backendUser, userLoading]);

  const handleLogout = async () => {
    try {
      // Sign out from NextAuth
      await signOut({ 
        redirect: false,
        callbackUrl: "/login"
      });
      
      // Clear any additional auth tokens
      if (typeof window !== "undefined") {
        localStorage.clear();
      }
      
      toast.success("Logout successful");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  // Show loading state
  if (sessionStatus === "loading" || userLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Profile"
        description="Manage your account settings and preferences"
        icon={UserCircle}
        tabs={[
          { icon: User, label: "Personal Info", href: "/profile" },
          { icon: Activity, label: "Activity", href: "/profile?tab=activity" },
          { icon: Bell, label: "Preferences", href: "/profile?tab=preferences" },
          { icon: Shield, label: "Security", href: "/profile?tab=security" },
        ]}
      />

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info Tab */}
            {activeTab === "personal" && (
              <>
                {/* Profile Card */}
                <Card className="pm-card border-0 overflow-hidden">
                  {/* Header with gradient background */}
                  <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 border-b border-gray-100">
                    <CardHeader className="pb-6 pt-8">
                      <div className="flex items-start gap-6">
                        <div className="relative">
                          <Avatar className="h-24 w-24 border-4 border-white shadow-xl ring-4 ring-gray-100">
                            <AvatarImage src={user.profile_pic || undefined} alt={user.first_name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white text-3xl font-bold">
                              {user.first_name?.[0]?.toUpperCase() || ""}{user.last_name?.[0]?.toUpperCase() || ""}
                            </AvatarFallback>
                          </Avatar>
                          {user.is_active && (
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-lg"></div>
                          )}
                        </div>
                        <div className="flex-1 pt-2">
                          <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {user.full_name || `${user.first_name} ${user.last_name}`.trim() || user.email}
                          </h2>
                          <p className="text-gray-600 mb-3 text-base">{user.email}</p>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                              user.is_active 
                                ? "bg-green-100 text-green-700 border border-green-200" 
                                : "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${user.is_active ? "bg-green-500" : "bg-gray-400"}`}></div>
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </div>
                  
                  {/* Details Section */}
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-blue-50">
                            <Mail className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-green-50">
                            <Phone className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {user.phone_number || <span className="text-gray-400 italic">Not provided</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-purple-50">
                            <Calendar className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Joined</p>
                            <p className="text-sm font-semibold text-gray-900">{user.joined_date || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-orange-50">
                            <Settings className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Role</p>
                            <p className="text-sm font-semibold text-gray-900">{user.role}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <Card className="pm-card border-0">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <Separator className="my-4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                          {i}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 mb-1">
                            Completed task "Implement user authentication"
                          </p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <Card className="pm-card border-0">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                  <Separator className="my-4" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive email updates about your projects</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-orange-600 focus:ring-orange-500 focus:ring-offset-0 rounded border-gray-300" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">In-App Notifications</p>
                      <p className="text-sm text-gray-500">Get notified within the application</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-orange-600 focus:ring-orange-500 focus:ring-offset-0 rounded border-gray-300" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Task Assignments</p>
                      <p className="text-sm text-gray-500">Notify when tasks are assigned to you</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-orange-600 focus:ring-orange-500 focus:ring-offset-0 rounded border-gray-300" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <Card className="pm-card border-0">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                  <p className="text-sm text-gray-500 mt-1">Your account is secured through Google SSO</p>
                  <Separator className="my-4" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg bg-blue-50/50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Lock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">Password Management</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Your password is managed by Google. To change your password, please visit your Google Account settings.
                        </p>
                        <a
                          href="https://myaccount.google.com/security"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Manage Google Account Security
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg bg-green-50/50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <KeyRound className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Two-factor authentication is managed through your Google Account. Enable it there to secure your account across all Google services.
                        </p>
                        <a
                          href="https://myaccount.google.com/signinoptions/two-step-verification"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                        >
                          Manage 2FA in Google Account
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Active Sessions</h4>
                    <p className="text-sm text-gray-500 mb-3">Your current active session information</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Current Device</p>
                          <p className="text-xs text-gray-500">{deviceInfo}</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Session managed by NextAuth. To manage all your Google sessions, visit your Google Account.
                      </p>
                      <a
                        href="https://myaccount.google.com/device-activity"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        View all Google sessions
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="pm-card border-0">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                <Separator className="my-4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart2 className="h-4 w-4" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="pm-card border-0">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
                <Separator className="my-4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <StatCard
                  icon={FolderKanban}
                  value={12}
                  label="Projects"
                  className="p-0 border-0 shadow-none bg-transparent"
                  iconBgColor="bg-blue-100"
                  iconColor="text-blue-600"
                />
                <StatCard
                  icon={CheckCircle2}
                  value={48}
                  label="Tasks Completed"
                  className="p-0 border-0 shadow-none bg-transparent"
                  iconBgColor="bg-green-100"
                  iconColor="text-green-600"
                />
                <StatCard
                  icon={Users}
                  value={5}
                  label="Teams"
                  className="p-0 border-0 shadow-none bg-transparent"
                  iconBgColor="bg-purple-100"
                  iconColor="text-purple-600"
                />
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
