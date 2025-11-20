"use client";

import React from "react";

// ProjectLayout is now just a pass-through
// Navigation tabs are handled in each project page
export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
