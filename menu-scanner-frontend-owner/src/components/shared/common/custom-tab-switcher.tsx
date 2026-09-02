"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TabOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  activeIconColor?: string;
}

interface CustomTabSwitcherProps {
  tabs: TabOption[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
  buttonClassName?: string;
}

export function CustomTabSwitcher({
  tabs,
  activeTab,
  onTabChange,
  className,
  buttonClassName,
}: CustomTabSwitcherProps) {
  return (
    <div
      className={cn(
        "p-1 bg-muted/40 rounded-xl border border-border/80 flex items-center gap-1",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-extrabold transition-all duration-200 cursor-pointer select-none",
              isActive
                ? "bg-background text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40",
              buttonClassName
            )}
          >
            {tab.icon && (
              <span className={cn("shrink-0", isActive && tab.activeIconColor)}>
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
