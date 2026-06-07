"use client";

import React from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
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
      className={cn("px-3 pt-3 pb-2 border-b flex-shrink-0", className)}
    >
      <div className="flex items-center gap-2">
        {showAvatar ? (
          <CustomAvatar size="xl" name={avatarName} imageUrl={avatarImageUrl} />
        ) : (
          <div
            className={cn(
              "p-1.5 border rounded shrink-0",
              iconBoxClass,
            )}
          >
            <Icon
              className={cn("h-4 w-4", iconColorClass)}
              strokeWidth={2.25}
            />
          </div>
        )}

        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <DialogTitle className="text-xs font-semibold leading-tight">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-[11px] leading-snug">
              {description}
            </DialogDescription>
          )}
        </div>
      </div>
    </DialogHeader>
  );
}
