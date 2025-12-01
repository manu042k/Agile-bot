import { LucideIcon } from "lucide-react";
import { ReactNode, forwardRef } from "react";
import Link from "next/link";

interface CreateCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  href?: string;
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
  as?: "button" | "div" | "link";
  children?: ReactNode;
}

const CreateCard = forwardRef<HTMLButtonElement | HTMLAnchorElement, CreateCardProps>(
  function CreateCard(
    {
      title,
      description,
      icon: Icon,
      onClick,
      href,
      iconBgColor = "bg-orange-100",
      iconColor = "text-orange-600",
      className = "",
      as: Component,
      children,
    },
    ref
  ) {
    const baseClasses = "pm-card p-4 text-left group hover:shadow-md transition-all";
    const borderClasses = "";
    
    // Auto-detect component type if not specified
    const componentType = Component || (href ? "link" : "button");
    
    const content = (
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconBgColor} transition-colors`}>
          <Icon className={`h-5 w-5 text-orange-600 transition-colors`} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    );

    if (componentType === "link" && href) {
      return (
        <Link
          href={href}
          className={`${baseClasses} ${borderClasses} ${className}`}
          onClick={onClick}
        >
          {content}
          {children}
        </Link>
      );
    }

    if (componentType === "button") {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          onClick={onClick}
          className={`${baseClasses} ${borderClasses} ${className}`}
          type="button"
        >
          {content}
          {children}
        </button>
      );
    }

    return (
      <div
        className={`${baseClasses} ${borderClasses} ${className}`}
        onClick={onClick}
      >
        {content}
        {children}
      </div>
    );
  }
);

CreateCard.displayName = "CreateCard";

export default CreateCard;

