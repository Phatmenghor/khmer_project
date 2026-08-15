"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LucideIcon, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomButton } from "../button/custom-button";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  count?: number;
  countLabel?: string;
  badgeText?: string;
  actions?: React.ReactNode;
  variant?: "hero" | "line";
  className?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  backHref?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  count,
  countLabel = "items",
  badgeText,
  actions,
  variant = "hero",
  className,
  showBackButton = false,
  onBack,
  backHref,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  const shouldShowBack = Boolean(showBackButton);

  if (variant === "hero") {
    const displayBadge =
      badgeText ||
      (count !== undefined && count > 0
        ? `${count} ${count === 1 ? countLabel.replace(/s$/, "") : countLabel}`
        : undefined);

    return (
      <div
        className={cn(
          "mb-4 sm:mb-6 overflow-hidden rounded-[20px] border border-border/80 bg-gradient-to-r from-primary/10 via-card to-primary/5 p-4 sm:p-5 shadow-2xs",
          className
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            {shouldShowBack && (
              <CustomButton
                variant="outline"
                size="icon"
                className="h-8.5 w-8.5 rounded-xl shrink-0 border-border/80 bg-background/80 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer shadow-2xs"
                onClick={handleBack}
                title="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </CustomButton>
            )}

            {Icon && (
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                <Icon className="h-5 w-5 text-primary fill-primary/20" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2 flex-wrap">
                <span className="truncate">{title}</span>
                {displayBadge && (
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 shrink-0">
                    {displayBadge}
                  </span>
                )}
              </h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5 font-medium truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "py-2 sm:py-3 mb-4 sm:mb-5 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          {shouldShowBack && (
            <CustomButton
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl shrink-0 border-border/80 bg-background/80 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer shadow-2xs"
              onClick={handleBack}
              title="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </CustomButton>
          )}
          {!shouldShowBack && <span className="w-1.5 h-5 sm:h-6 rounded-full bg-primary inline-block shrink-0" />}
          {Icon && <Icon className="h-5 w-5 text-primary shrink-0" />}
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground truncate">
            {title}
          </h1>
          {count !== undefined && count > 0 && !subtitle && (
            <span className="shrink-0 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
              {count.toLocaleString()}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 pl-4 font-normal truncate">
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
  );
}
