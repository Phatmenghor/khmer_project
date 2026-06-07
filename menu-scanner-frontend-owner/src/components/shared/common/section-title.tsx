"use client";

import type React from "react";
import { CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface SectionTitleProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}

/**
 * Standard section-card header used inside modals and admin pages.
 * Renders an icon tile + title + optional subtitle in a compact row,
 * matching the styling used across the client/portfolio pages.
 *
 * Usage:
 *   <CardHeader>
 *     <SectionTitle icon={User} title="Customer" subtitle="Account info" />
 *   </CardHeader>
 */
export function SectionTitle({ icon: Icon, title, subtitle }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="shrink-0 p-1.5 rounded-md bg-primary/10 text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <CardTitle className="text-sm font-semibold leading-tight truncate">
          {title}
        </CardTitle>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
