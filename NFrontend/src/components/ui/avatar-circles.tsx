"use client";

import { cn } from "@/lib/utils";

interface AvatarCirclesProps {
  className?: string;
  avatarData: string[];
}

const AvatarCircles = ({ className, avatarData }: AvatarCirclesProps) => {
  const numPeople = avatarData.length;
  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {avatarData.map((name, index) => {
        const initials =
          name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase() || "?";
        const fullName = `${name}`;
        return (
          <div
            key={index}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-700 dark:text-gray-200"
            title={fullName} // Show full name on hover
          >
            {initials}
          </div>
        );
      })}
      {numPeople > 0 ? (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800 dark:bg-white dark:text-black">
          {numPeople}
        </div>
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-300 text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800 dark:bg-white dark:text-black">
          0
        </div>
      )}
    </div>
  );
};

export default AvatarCircles;
