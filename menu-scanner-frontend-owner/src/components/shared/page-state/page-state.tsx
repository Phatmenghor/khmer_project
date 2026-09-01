"use client";

import React from "react";
import Link from "next/link";
import {
  PackageOpen,
  Search,
  AlertCircle,
  Loader2,
  WifiOff,
  Lock,
  Wrench,
  FileQuestion,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomButton } from "@/components/shared/button/custom-button";

export type PageStateType =
  | "loading"
  | "empty"
  | "error"
  | "no-results"
  | "not-found"
  | "maintenance"
  | "unauthorized"
  | "offline";

export interface PageStateProps {
  type: PageStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  onSecondaryAction?: () => void;
  illustration?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/* ── defaults per type ─────────────────────────────────────────────────────── */

const DEFAULTS: Record<
  PageStateType,
  {
    title: string;
    description: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
  }
> = {
  loading: {
    title: "Loading…",
    description: "Please wait while we fetch your data.",
    icon: Loader2,
    iconBg: "bg-primary/10 border border-primary/20",
    iconColor: "text-primary",
  },
  empty: {
    title: "Nothing here yet",
    description: "There is no data to display at this time.",
    icon: PackageOpen,
    iconBg: "bg-primary/10 border border-primary/20 ring-4 ring-primary/5",
    iconColor: "text-primary",
  },
  error: {
    title: "Something went wrong",
    description: "We couldn't load the content. Please try again.",
    icon: AlertCircle,
    iconBg: "bg-destructive/10 border border-destructive/20 ring-4 ring-destructive/5",
    iconColor: "text-destructive",
  },
  "no-results": {
    title: "No results found",
    description: "Try adjusting your search terms or filters.",
    icon: Search,
    iconBg: "bg-primary/10 border border-primary/20 ring-4 ring-primary/5",
    iconColor: "text-primary",
  },
  "not-found": {
    title: "Page not found",
    description: "The item you're looking for doesn't exist or has been removed.",
    icon: FileQuestion,
    iconBg: "bg-muted border border-border/60",
    iconColor: "text-muted-foreground",
  },
  maintenance: {
    title: "Under maintenance",
    description: "We're making some improvements. Please check back shortly.",
    icon: Wrench,
    iconBg: "bg-amber-100 dark:bg-amber-900/20 border border-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  unauthorized: {
    title: "Access denied",
    description: "You need to sign in to view this content.",
    icon: Lock,
    iconBg: "bg-muted border border-border/60",
    iconColor: "text-muted-foreground",
  },
  offline: {
    title: "You're offline",
    description: "Check your internet connection and try again.",
    icon: WifiOff,
    iconBg: "bg-muted border border-border/60",
    iconColor: "text-muted-foreground",
  },
};

const DEFAULT_ACTION_LABELS: Partial<Record<PageStateType, string>> = {
  error: "Try again",
  offline: "Retry",
  "not-found": "Go back",
};

const DEFAULT_ACTION_ICONS: Partial<Record<PageStateType, React.ElementType>> = {
  error: RefreshCw,
  offline: RefreshCw,
  "not-found": ArrowLeft,
};

/* ── size styles ───────────────────────────────────────────────────────────── */

const SIZE_STYLES = {
  sm: {
    container: "py-6",
    iconWrap: "w-11 h-11 mb-3",
    icon: "h-5 w-5",
    title: "text-xs font-bold",
    description: "text-xs max-w-xs",
    gap: "gap-2",
  },
  md: {
    container: "py-10",
    iconWrap: "w-14 h-14 mb-4",
    icon: "h-7 w-7",
    title: "text-sm font-bold",
    description: "text-xs max-w-sm",
    gap: "gap-2.5",
  },
  lg: {
    container: "py-14",
    iconWrap: "w-16 h-16 mb-4",
    icon: "h-8 w-8",
    title: "text-base font-extrabold",
    description: "text-xs max-w-md",
    gap: "gap-3",
  },
};

/* ── component ─────────────────────────────────────────────────────────────── */

export function PageState({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
  onSecondaryAction,
  illustration,
  className,
  size = "md",
}: PageStateProps) {
  const defaults = DEFAULTS[type];
  const s = SIZE_STYLES[size];
  const Icon = defaults.icon;

  const resolvedTitle = title ?? defaults.title;
  const resolvedDesc = description ?? defaults.description;

  const primaryLabel =
    actionLabel ?? DEFAULT_ACTION_LABELS[type];
  const PrimaryIcon = DEFAULT_ACTION_ICONS[type];

  const isLoading = type === "loading";
  const isEmpty = type === "empty";

  const inner = (
    <>
      {/* Illustration or icon */}
      {illustration ?? (
        <div
          className={cn(
            "flex items-center justify-center rounded-full shadow-2xs transition-transform duration-300 hover:scale-105",
            s.iconWrap,
            defaults.iconBg
          )}
        >
          <Icon
            className={cn(
              s.icon,
              defaults.iconColor,
              isLoading && "animate-spin"
            )}
            strokeWidth={1.75}
            aria-hidden
          />
        </div>
      )}

      {/* Title */}
      <h3 className={cn("text-foreground mb-1 tracking-tight font-extrabold", s.title)}>{resolvedTitle}</h3>

      {/* Description */}
      <p
        className={cn(
          "text-muted-foreground mb-5 mx-auto leading-relaxed font-medium",
          s.description
        )}
      >
        {resolvedDesc}
      </p>

      {/* Actions */}
      {(primaryLabel || secondaryActionLabel) && (
        <div className={cn("flex flex-wrap items-center justify-center", s.gap)}>
          {primaryLabel && (
            actionHref ? (
              <CustomButton asChild size="sm" className="gap-1.5 h-9 px-5 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-white shadow-2xs hover:shadow-md transition-all cursor-pointer">
                <Link href={actionHref}>
                  {PrimaryIcon && <PrimaryIcon className="h-3.5 w-3.5" aria-hidden />}
                  {primaryLabel}
                </Link>
              </CustomButton>
            ) : onAction ? (
              <CustomButton
                size="sm"
                className="gap-1.5 h-9 px-5 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-white shadow-2xs hover:shadow-md transition-all cursor-pointer"
                onClick={onAction}
              >
                {PrimaryIcon && <PrimaryIcon className="h-3.5 w-3.5" aria-hidden />}
                {primaryLabel}
              </CustomButton>
            ) : null
          )}

          {secondaryActionLabel && (
            secondaryActionHref ? (
              <CustomButton
                asChild
                size="sm"
                variant="outline"
                className="gap-1.5 h-9 px-5 rounded-xl font-bold text-xs border-border/60 hover:bg-muted/50 transition-all cursor-pointer"
              >
                <Link href={secondaryActionHref}>
                  {secondaryActionLabel}
                </Link>
              </CustomButton>
            ) : onSecondaryAction ? (
              <CustomButton
                size="sm"
                variant="outline"
                className="gap-1.5 h-9 px-5 rounded-xl font-bold text-xs border-border/60 hover:bg-muted/50 transition-all cursor-pointer"
                onClick={onSecondaryAction}
              >
                {secondaryActionLabel}
              </CustomButton>
            ) : null
          )}
        </div>
      )}
    </>
  );

  if (isEmpty) {
    return (
      <div
        className={cn(
          "w-full rounded-[24px] border border-dashed border-border/80 bg-gradient-to-b from-card via-card to-muted/20 shadow-2xs",
          "flex flex-col items-center justify-center text-center",
          "animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
          "px-6",
          s.container,
          className
        )}
        role="region"
        aria-label={resolvedTitle}
      >
        {inner}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
        s.container,
        className
      )}
      role={isLoading ? "status" : "region"}
      aria-label={resolvedTitle}
      aria-live={isLoading ? "polite" : undefined}
    >
      {inner}
    </div>
  );
}
