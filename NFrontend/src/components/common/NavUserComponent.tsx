import { LogOut, User, Users } from "lucide-react";
import { Button } from "../ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const NavUserComponent = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut({ 
        callbackUrl: '/login',
        redirect: true 
      });
      toast.success("Logout successful");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  const handdleProfile = () => {
    router.push("/profile");
  };

  const handleTeams = () => {
    router.push("/teams");
  };
  return (
    <div className="w-64 p-2">
      <div className="space-y-1">
        <button
          onClick={handdleProfile}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/50 rounded-lg transition-all duration-200 group"
        >
          <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
            <User className="w-3 h-3 text-foreground" />
          </div>
          <span className="font-semibold">Profile</span>
        </button>
        
        <button
          onClick={handleTeams}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/50 rounded-lg transition-all duration-200 group"
        >
          <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
            <Users className="w-3 h-3 text-foreground" />
          </div>
          <span className="font-semibold">Teams</span>
        </button>
        
        <div className="my-2 h-px bg-border" />
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 group"
        >
          <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <LogOut className="w-3 h-3 text-destructive" />
          </div>
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default NavUserComponent;
