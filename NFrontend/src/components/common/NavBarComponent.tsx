import { Label } from "@/components/ui/label";
import { ListTodo } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import userInfoService from "@/services/userInfoService";
import { useEffect, useState } from "react";
import { User } from "@/types/user";
import { toast } from "react-hot-toast";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import NavUserComponent from "./NavUserComponent";
import BreadcrumbNavigation from "./BreadcrumbRoute";
import { useNavigate } from "react-router-dom";
const NavBarComponent = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
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

  return (
    <header className="fixed flex h-16 shrink-0 items-center gap-2 border-b px-4 w-full ">
      <ListTodo
        className="w-[20px] h-[20px] text-black font-bold "
        aria-hidden="true"
      />
      <Label
        onClick={() => navigate("/projects")}
        className="text-lg sm:text-lg font-bold"
        htmlFor="name"
      >
        AgileBot
      </Label>

      <Separator orientation="vertical" className="mr-2 h-4 ml-[130px]" />
      <BreadcrumbNavigation></BreadcrumbNavigation>
      <Popover>
        <PopoverTrigger asChild>
          <a className="flex items-center ml-auto hover:bg-gray-200 p-2 rounded-lg">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user?.profile_pic} alt="user" />
              <AvatarFallback className="rounded-lg">
                {user?.first_name[0]}
                {user?.last_name[0]}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="ml-3 text-left text-sm">
              <span className="block truncate font-semibold">
                {user?.first_name}
              </span>
              <span className="block truncate text-xs text-gray-500">
                {user?.email}
              </span>
            </div>
          </a>
        </PopoverTrigger>
        <PopoverContent className="w-auto">
          <NavUserComponent></NavUserComponent>
        </PopoverContent>
      </Popover>
    </header>
  );
};

export default NavBarComponent;
