"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FormBodyProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function FormBody({
  children,
  className,
  contentClassName,
}: FormBodyProps) {
  return (
    <ScrollArea className={cn("flex-1 min-h-0 overflow-y-auto", className)}>
      <div className={cn("p-3 sm:p-4 space-y-3", contentClassName)}>
        {children}
      </div>
    </ScrollArea>
  );
}
