import { LogOut, User, Users } from "lucide-react";
import { Button } from "../ui/button";
import authService from "@/services/authService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const NavUserComponent = () => {
  const router = useRouter();

  const handleLogout = () => {
    authService.logout();
    toast.success("Logout successful");
    router.push("/");
  };

  const handdleProfile = () => {
    router.push("/profile");
  };

  const handleTeams = () => {
    router.push("/teams");
  };
  return (
    <div className="flex flex-col space-y-2">
      <Button variant="ghost" onClick={handdleProfile}>
        <User className="mr-2" />
        <span className=" font-bold">Profile</span>
      </Button>
      <Button variant="ghost" onClick={handleTeams}>
        <Users className="mr-2" />
        <span className=" font-bold">Teams</span>
      </Button>
      <Button variant="ghost" onClick={handleLogout}>
        <LogOut className="mr-2" />
        <span className=" font-bold">Logout</span>
      </Button>
    </div>
  );
};

export default NavUserComponent;
