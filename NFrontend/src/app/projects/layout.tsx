"use client";
import React from "react";

// This layout is now handled by MainLayout
// Keeping this file to avoid breaking imports, but it just passes through children
const ProjectsLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default ProjectsLayout;
