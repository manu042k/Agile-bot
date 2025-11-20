"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface TabItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  tabs?: TabItem[];
  showTabs?: boolean;
}

export default function PageHeader({ 
  title, 
  description, 
  icon: Icon, 
  tabs = [],
  showTabs = true 
}: PageHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navItems = tabs.map(item => {
    const itemPath = item.href.split('?')[0];
    const itemTabParam = item.href.includes('tab=') ? item.href.split('tab=')[1] : null;
    const currentTab = searchParams.get('tab');
    
    // Check if pathname matches
    const pathMatches = itemPath === pathname;
    
    // Check if tab parameter matches (or both are null/undefined)
    const tabMatches = itemTabParam === currentTab || (!itemTabParam && !currentTab);
    
    const isActive = pathMatches && tabMatches;
    
    return {
      ...item,
      active: isActive
    };
  });

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-700" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        {showTabs && tabs.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const TabIcon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    item.active
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <TabIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

