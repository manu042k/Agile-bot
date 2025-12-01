"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  Command,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NavUserComponent from "../common/NavUserComponent";
import EnhancedBreadcrumb from "../common/EnhancedBreadcrumb";
import GlobalSearch from "../common/GlobalSearch";
import NotificationCenter from "../common/NotificationCenter";
import { useSession } from "next-auth/react";
import Logo from "@/assets/logo.png";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Don't show sidebar on auth pages
  const authPages = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];
  const isAuthPage =
    authPages.includes(pathname) || pathname.startsWith("/reset-password");

  // Use NextAuth session for authentication status
  const { data: session, status } = useSession();

  // Redirect to login if not authenticated on protected pages
  useEffect(() => {
    if (!isAuthPage && status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, isAuthPage, router]);

  // Keyboard shortcuts - MUST be called before any conditional returns
  useEffect(() => {
    // Only set up keyboard shortcuts on protected pages
    if (isAuthPage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + P for create project
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        router.push("/projects");
      }
      // Cmd/Ctrl + C for create task (when not in input)
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "c" &&
        e.target instanceof HTMLInputElement === false &&
        e.target instanceof HTMLTextAreaElement === false
      ) {
        e.preventDefault();
        router.push("/tasks");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, isAuthPage]);

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
      name: "Activity",
      href: "/activity",
      icon: Activity,
      active: pathname.startsWith("/activity"),
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

  // Early return for auth pages - render children without sidebar
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (status === "unauthenticated") {
    return null; // Middleware will handle redirect
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen glass-sidebar transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-56"
        }`}
      >
        {/* Logo */}
        <div className="h-16 border-b border-white/20 flex items-center px-4">
          {!sidebarCollapsed ? (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8">
                <Image
                  src={Logo}
                  alt="AgileBot logo"
                  width={32}
                  height={32}
                  priority
                  className="h-8 w-8 object-contain"
                />
              </div>
              <span className="font-semibold text-gray-900">AgileBot</span>
            </Link>
          ) : (
            <div className="w-8 h-8 mx-auto">
              <Image
                src={Logo}
                alt="AgileBot logo"
                width={32}
                height={32}
                priority
                className="h-8 w-8 object-contain"
              />
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
                    ? "bg-orange-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/50 hover:text-gray-900"
                }`}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-white/20">
            <Link
              href="/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                pathname.startsWith("/settings")
                  ? "bg-orange-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/50 hover:text-gray-900"
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
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-white/50 transition-all"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <div
                className={`w-4 h-0.5 bg-gray-600 transition-all ${
                  sidebarCollapsed ? "rotate-0" : "rotate-180"
                }`}
              />
            </div>
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-56"
        }`}
      >
        {/* Top Header */}
        <header className="h-16 glass-navbar flex items-center gap-4 px-6 sticky top-0 z-30">
          {/* Breadcrumb Navigation */}
          <div className="flex-1 min-w-0">
            <EnhancedBreadcrumb />
          </div>

          {/* Search */}
          <div className="hidden lg:flex">
            <GlobalSearch />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Notifications */}
            <NotificationCenter />

            {/* User Menu */}
            {session?.user && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.user.image || undefined}
                        alt={session.user.name || "User"}
                      />
                      <AvatarFallback className="bg-gray-900 text-white text-xs font-medium">
                        {session.user.name?.[0] ||
                          session.user.email?.[0] ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0" align="end">
                  <NavUserComponent />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative w-full max-w-full">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
