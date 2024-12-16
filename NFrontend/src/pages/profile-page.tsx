import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import authService from "@/services/authService";
import userInfoService from "@/services/userInfoService";
import { User } from "@/types/user";
import { BarChart2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();
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
    navigate("/");
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
              <span className="text-sm text-gray-600">{user?.email}</span>
              <span className="text-sm text-gray-600">
                {user?.phone_number}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="mt-6">
          <div className="flex gap-4">
            {" "}
            <Button
              variant="default"
              className="w-full py-3 bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
            {/* Projects Button */}
            <Button
              variant="default"
              className="w-full py-3 bg-green-600 text-white hover:bg-green-700 transition duration-200"
              onClick={() => navigate("/projects")}
            >
              <BarChart2 className="w-5 h-5 mr-2" />
              Projects
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
