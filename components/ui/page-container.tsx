"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

const maxWidthClasses = {
  sm: "max-w-(--breakpoint-sm)",
  md: "max-w-(--breakpoint-md)",
  lg: "max-w-(--breakpoint-lg)",
  xl: "max-w-(--breakpoint-xl)",
  full: "max-w-full",
};

export function PageContainer({
  children,
  className,
  maxWidth = "xl",
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full px-4 mx-auto",
        maxWidthClasses[maxWidth],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
