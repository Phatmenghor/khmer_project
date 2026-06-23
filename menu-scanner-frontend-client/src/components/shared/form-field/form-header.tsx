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

interface FormHeaderProps {
  title: string;
  description?: string;
  avatarName?: string;
  avatarImageUrl?: string;
  showAvatar?: boolean;
  isCreate?: boolean;
  icon?: LucideIcon;
  variant?: FormHeaderVariant;
  className?: string;
}

export function FormHeader({
  title,
  description,
  avatarName,
  avatarImageUrl,
  showAvatar = false,
  isCreate = true,
  icon,
  variant = "default",
  className,
}: FormHeaderProps) {
  const Icon = icon ?? (isCreate ? Plus : Edit);

  const isDestructive = variant === "destructive";
  const iconBoxClass = isDestructive
    ? "bg-destructive/10 border-destructive/30"
    : "bg-primary/10 border-primary/30";
  const iconColorClass = isDestructive ? "text-destructive" : "text-primary";

  return (
    <DialogHeader
      className={cn(
        "-mx-4 -mt-4 px-4 py-4 md:-mx-6 md:-mt-4 md:px-6 md:py-5 border-b border-primary/30 flex-shrink-0",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {}
        {showAvatar ? (
          <CustomAvatar size="xl" name={avatarName} imageUrl={avatarImageUrl} />
        ) : (
          <div
            className={cn(
              "flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg shrink-0",
              iconBoxClass,
            )}
          >
            <Icon
              className={cn("h-5 w-5", iconColorClass)}
              strokeWidth={2.25}
            />
          </div>
        )}

        {}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <DialogTitle className="text-sm md:text-base font-semibold leading-tight text-foreground">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-xs text-muted-foreground leading-snug">
              {description}
            </DialogDescription>
          )}
        </div>
      </div>
    </DialogHeader>
  );
}
