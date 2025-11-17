"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import authService from "@/services/authService";
import userInfoService from "@/services/userInfoService";
import { User } from "@/types/user";
import { BarChart2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userInfoService.getUserInfo();
        setUser(response);
      } catch (err: any) {
        toast.error("Something went wrong");
      }
    };

    fetchUser();
  }, []);
  // Handle Logout
  const handleLogout = () => {
    authService.logout();
    toast.success("Logout successful");
    router.push("/");
  };

  return (
    <div className="flex flex-col gap-8 p-10 bg-gray-50 min-h-screen">
      {/* Profile Section */}
      <Card className="bg-white shadow-xl rounded-lg p-8 w-full max-w-4xl mx-auto">
        <CardHeader className="border-b-2 pb-6">
          <div className="flex items-center gap-8">
            <Avatar className="h-20 w-20 rounded-full shadow-xl">
              <AvatarImage src={user?.profile_pic} alt="user" />
              <AvatarFallback className="rounded-full  text-xl">
                {user?.first_name[0]}
                {user?.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-2xl font-semibold">
                {user?.first_name} {user?.last_name}
              </span>
              <span className="text-gray-500">{user?.email}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Phone Number</h3>
              <p className="text-gray-600">{user?.phone_number}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Active Status</h3>
              <p
                className={`font-semibold ${
                  user?.is_active ? "text-green-500" : "text-red-500"
                }`}
              >
                {user?.is_active ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Section */}
      <div className="w-full max-w-4xl mx-auto flex justify-end gap-4">
        <Button variant="outline">
          <BarChart2 className="mr-2 h-5 w-5" />
          View Activity
        </Button>
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
