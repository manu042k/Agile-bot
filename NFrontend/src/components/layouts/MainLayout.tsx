"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  FileText,
  BarChart3,
  Settings,
  Bell,
  Search,
  Command
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import NavUserComponent from "../common/NavUserComponent";
import EnhancedBreadcrumb from "../common/EnhancedBreadcrumb";
import { useUser } from "@/hooks/useUser";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Don't show sidebar on auth pages
  const authPages = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
  if (authPages.includes(pathname)) {
    return <>{children}</>;
  }

  const mainNavItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard" || pathname === "/",
    },
    {
      name: "Projects",
      href: "/projects",
      icon: FolderKanban,
      active: pathname.startsWith("/projects"),
    },
    {
      name: "Tasks",
      href: "/tasks",
      icon: CheckSquare,
      active: pathname.startsWith("/tasks"),
    },
    {
      name: "Teams",
      href: "/teams",
      icon: Users,
      active: pathname.startsWith("/teams"),
    },
    {
      name: "Documents",
      href: "/documents",
      icon: FileText,
      active: pathname.startsWith("/documents"),
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      active: pathname.startsWith("/analytics"),
    },
  ];

  const isActive = (active: boolean) => active;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? "w-16" : "w-64"
      }`}>
        {/* Logo */}
        <div className="h-16 border-b border-gray-200 flex items-center px-4">
          {!sidebarCollapsed ? (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AB</span>
              </div>
              <span className="font-semibold text-gray-900">AgileBot</span>
            </Link>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">AB</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.active);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-200">
            <Link
              href="/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                pathname.startsWith("/settings")
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
              title={sidebarCollapsed ? "Settings" : undefined}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>Settings</span>}
            </Link>
          </div>
        </nav>

        {/* Collapse Button */}
        <div className="absolute bottom-4 left-0 right-0 px-3">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-all"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <div className={`w-4 h-0.5 bg-gray-600 transition-all ${sidebarCollapsed ? "rotate-0" : "rotate-180"}`} />
            </div>
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center gap-4 px-6 sticky top-0 z-30">
          {/* Breadcrumb Navigation */}
          <div className="flex-1 min-w-0">
            <EnhancedBreadcrumb />
          </div>
          
          {/* Search */}
          <div className="hidden lg:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gray-400">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">⌘</kbd>
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">K</kbd>
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-gray-900 rounded-full" />
            </button>

            {/* User Menu */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profile_pic || undefined} alt={user?.first_name} />
                    <AvatarFallback className="bg-gray-900 text-white text-xs font-medium">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="end">
                <NavUserComponent />
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

