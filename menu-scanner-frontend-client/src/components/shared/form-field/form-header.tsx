"use client";

import React from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { Plus, Edit, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FormHeaderVariant = "default" | "destructive";

export interface FormHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  avatarName?: string;
  avatarImageUrl?: string;
  avatarIcon?: React.ReactNode;
  showAvatar?: boolean;
  isCreate?: boolean;
  icon?: LucideIcon;
  variant?: FormHeaderVariant;
  className?: string;
}

export function FormHeader({
  title,
  description,
  subtitle,
  avatarName,
  avatarImageUrl,
  avatarIcon,
  showAvatar = false,
  isCreate = true,
  icon,
  variant = "default",
  className,
}: FormHeaderProps) {
  const Icon = icon ?? (isCreate ? Plus : Edit);
  const displayDescription = description ?? subtitle;

  const isDestructive = variant === "destructive";
  const iconBoxClass = isDestructive
    ? "bg-destructive/10 border-destructive/30"
    : "bg-primary/10 border-primary/30";
  const iconColorClass = isDestructive ? "text-destructive" : "text-primary";

  return (
    <DialogHeader
      className={cn(
        "px-4 py-3 border-b border-border/80 flex-shrink-0 bg-background",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {showAvatar ? (
          avatarIcon ? (
            <div
              className={cn(
                "flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg shrink-0 border",
                iconBoxClass,
              )}
            >
              {avatarIcon}
            </div>
          ) : (
            <CustomAvatar size="xl" name={avatarName} imageUrl={avatarImageUrl} />
          )
        ) : (
          <div
            className={cn(
              "flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg shrink-0 border",
              iconBoxClass,
            )}
          >
            <Icon
              className={cn("h-5 w-5", iconColorClass)}
              strokeWidth={2.25}
            />
          </div>
        )}

        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <DialogTitle className="text-sm md:text-base font-semibold leading-tight text-foreground">
            {title}
          </DialogTitle>
          {displayDescription && (
            <DialogDescription className="text-xs text-muted-foreground leading-snug">
              {displayDescription}
            </DialogDescription>
          )}
        </div>
      </div>
    </DialogHeader>
  );
}
