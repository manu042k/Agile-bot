import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  text = "Loading...",
  fullScreen = false,
}) => {
  const containerClass = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
    : "flex items-center justify-center p-12";

  return (
    <div className={containerClass}>
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-muted-foreground">{text}</p>
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="crm-card p-6 animate-pulse">
    <div className="h-4 bg-muted rounded w-3/4 mb-4" />
    <div className="h-3 bg-muted rounded w-full mb-2" />
    <div className="h-3 bg-muted rounded w-5/6" />
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <div className="h-12 bg-muted rounded flex-1" />
        <div className="h-12 bg-muted rounded w-24" />
      </div>
    ))}
  </div>
);
