"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { LucideIcon, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

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
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filterOptions?: { value: string; label: string }[];
  filterValue?: string;
  onFilterChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  viewModeButtons?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  icon: Icon,
  tabs = [],
  showTabs = true,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filterOptions,
  filterValue,
  onFilterChange,
  viewModeButtons,
}: PageHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navItems = tabs.map((item) => {
    const itemPath = item.href.split("?")[0];
    const itemTabParam = item.href.includes("tab=")
      ? item.href.split("tab=")[1]
      : null;
    const currentTab = searchParams.get("tab");

    // Check if pathname matches
    const pathMatches = itemPath === pathname;

    // Check if tab parameter matches (or both are null/undefined)
    const tabMatches =
      itemTabParam === currentTab || (!itemTabParam && !currentTab);

    const isActive = pathMatches && tabMatches;

    return {
      ...item,
      active: isActive,
    };
  });

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        {/* Title Section */}
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-700" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>

        {/* Search, Filter, View Mode, and Tabs - All in Single Row */}
        {(searchPlaceholder ||
          filterOptions ||
          viewModeButtons ||
          (showTabs && tabs.length > 0)) && (
          <>
            <Separator className="bg-gray-200 mb-3" />
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
              {/* Search Control */}
              {searchPlaceholder &&
                searchValue !== undefined &&
                onSearchChange && (
                  <div className="relative w-64 flex-shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                    <input
                      type="text"
                      placeholder={searchPlaceholder}
                      value={searchValue}
                      onChange={onSearchChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                )}

              {/* Filter Control */}
              {filterOptions && filterValue !== undefined && onFilterChange && (
                <select
                  value={filterValue}
                  onChange={onFilterChange}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-[160px] flex-shrink-0"
                >
                  {filterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {/* View Mode Buttons */}
              {viewModeButtons && (
                <div className="flex-shrink-0">{viewModeButtons}</div>
              )}

              {/* Separator between controls and tabs */}
              {(searchPlaceholder || filterOptions || viewModeButtons) &&
                showTabs &&
                tabs.length > 0 && (
                  <div className="h-8 w-px bg-gray-200 flex-shrink-0" />
                )}

              {/* Navigation Tabs */}
              {showTabs && tabs.length > 0 && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {navItems.map((item) => {
                    const TabIcon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                          item.active
                            ? "bg-gray-900 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent"
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
          </>
        )}
      </div>
    </div>
  );
}
