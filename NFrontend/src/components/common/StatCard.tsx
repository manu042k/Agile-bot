import { LucideIcon } from "lucide-react";

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
}

export default function StatCard({
  value,
  label,
  icon: Icon,
  iconBgColor = "bg-gray-100",
  iconColor = "text-gray-700",
  className = "",
}: StatCardProps) {
  return (
    <div className={`pm-card p-5 ${className}`}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`p-2 rounded-lg ${iconBgColor} flex-shrink-0`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
}

