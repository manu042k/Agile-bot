import { LucideIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DetailItem {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconBgColor?: string;
  iconColor?: string;
}

interface DetailsCardProps {
  title?: string;
  items: DetailItem[];
}

export default function DetailsCard({ title = "Overview", items }: DetailsCardProps) {
  return (
    <div className="pm-card p-6">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <Separator className="mb-4" />
      <div className="space-y-4">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.iconBgColor || 'bg-gray-100'}`}>
                  <Icon className={`h-4 w-4 ${item.iconColor || 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
