"use client";
import { ListTodo } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import NavUserComponent from "./NavUserComponent";
import EnhancedBreadcrumb from "./EnhancedBreadcrumb";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { LoadingSpinner } from "./Loading";
import authService from "@/services/authService";

const NavBarComponent = () => {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Don't render navbar on auth pages (landing, login, register, forgot-password)
  const authPages = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
  if (authPages.includes(pathname)) {
    return null;
  }

  const handleLogoClick = () => {
    // If authenticated, go to projects, otherwise go to landing page
    if (authService.isAuthenticated()) {
      router.push("/projects");
    } else {
      router.push("/");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-sm border-b border-border/50 z-50 shadow-sm">
      <div className="container mx-auto h-full px-6 flex items-center gap-6">
        {/* Logo Section */}
        <button 
          onClick={handleLogoClick}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <ListTodo className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground hidden sm:block">
            AgileBot
          </span>
        </button>

        {/* Breadcrumb Navigation */}
        <Separator orientation="vertical" className="h-6 hidden lg:block" />
        <div className="flex-1 min-w-0">
          <EnhancedBreadcrumb />
        </div>

        {/* User Menu */}
        {loading ? (
          <div className="flex items-center gap-3 px-3 py-2">
            <LoadingSpinner size="sm" />
          </div>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 transition-all duration-200 group">
                <Avatar className="h-9 w-9 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all">
                  <AvatarImage src={user?.profile_pic} alt={user?.first_name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user?.first_name?.[0]}
                    {user?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user?.email}
                  </div>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <NavUserComponent />
            </PopoverContent>
          </Popover>
        )}
      </div>
    </header>
  );
};

export default NavBarComponent;
