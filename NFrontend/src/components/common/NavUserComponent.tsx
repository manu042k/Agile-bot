import { LogOut, User, Users } from "lucide-react";
import { Button } from "../ui/button";
import authService from "@/services/authService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const NavUserComponent = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    toast.success("Logout successful");
    navigate("/");
  };

  return (
    <div className="flex flex-col space-y-2">
      <Button variant="ghost">
        <User className="mr-2" />
        <span className=" font-bold">Profile</span>
      </Button>
      <Button variant="ghost">
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
