"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BarChart2, LogOut, Mail, Phone, Calendar, Settings, User, Activity, Bell, Shield, UserCircle } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import PageHeader from "@/components/common/PageHeader";

// Mock user data
const mockUser = {
  id: 1,
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  phone_number: "+1 (555) 123-4567",
  is_active: true,
  profile_pic: null,
  joined_date: "2024-01-15",
  role: "Project Manager"
};

const ProfilePage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "personal";

  const handleLogout = () => {
    toast.success("Logout successful");
    router.push("/");
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info Tab */}
            {activeTab === "personal" && (
              <>
                {/* Profile Card */}
                <Card className="pm-card border-0">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                        <AvatarImage src={mockUser.profile_pic || undefined} alt={mockUser.first_name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                          {mockUser.first_name[0]}{mockUser.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                          {mockUser.first_name} {mockUser.last_name}
                        </h2>
                        <p className="text-gray-500 mb-2">{mockUser.email}</p>
                        <span className={`pm-badge ${mockUser.is_active ? "pm-status-badge-done" : "pm-status-badge-backlog"}`}>
                          {mockUser.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <Mail className="h-4 w-4" />
                          <span>Email</span>
                        </div>
                        <p className="text-gray-900 font-medium">{mockUser.email}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <Phone className="h-4 w-4" />
                          <span>Phone</span>
                        </div>
                        <p className="text-gray-900 font-medium">{mockUser.phone_number}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span>Joined</span>
                        </div>
                        <p className="text-gray-900 font-medium">{mockUser.joined_date}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <Settings className="h-4 w-4" />
                          <span>Role</span>
                        </div>
                        <p className="text-gray-900 font-medium">{mockUser.role}</p>
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
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive email updates about your projects</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-gray-900" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">In-App Notifications</p>
                      <p className="text-sm text-gray-500">Get notified within the application</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-gray-900" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Task Assignments</p>
                      <p className="text-sm text-gray-500">Notify when tasks are assigned to you</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-gray-900" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <Card className="pm-card border-0">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Change Password</h4>
                    <p className="text-sm text-gray-500 mb-4">Update your password to keep your account secure</p>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500 mb-4">Add an extra layer of security to your account</p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Active Sessions</h4>
                    <p className="text-sm text-gray-500 mb-2">Manage your active sessions</p>
                    <p className="text-xs text-gray-400">Current session: This device</p>
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
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="pm-card border-0">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-semibold text-gray-900">12</p>
                  <p className="text-sm text-gray-500">Projects</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900">48</p>
                  <p className="text-sm text-gray-500">Tasks Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900">5</p>
                  <p className="text-sm text-gray-500">Teams</p>
                </div>
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
