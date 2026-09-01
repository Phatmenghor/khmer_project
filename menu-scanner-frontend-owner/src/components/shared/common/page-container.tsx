import { cn } from "@/lib/utils";
import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}


export const PageContainer = ({
  children,
  className,
  as: Component = "div",
}: PageContainerProps) => {
  return (
    <Component
      className={cn("max-w-7xl mx-auto px-3 sm:px-4 lg:px-5", className)}
    >
      {children}
    </Component>
  );
};
