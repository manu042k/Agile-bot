"use client";

import React from "react";

import { cn } from "@/lib/utils";

interface Avatar {
  firstName: string;
  lastName: string;
}
interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  avatarNames: Avatar[];
}

const AvatarCircles = ({
  numPeople,
  className,
  avatarNames,
}: AvatarCirclesProps) => {
  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {avatarNames.map((person, index) => {
        const initials =
          `${person.firstName[0]}${person.lastName[0]}`.toUpperCase();
        const fullName = `${person.firstName} ${person.lastName}`;
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
      {numPeople && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800 dark:bg-white dark:text-black">
          +{numPeople}
        </div>
      )}
    </div>
  );
};

export default AvatarCircles;
