"use client";

import React from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { Plus, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormHeaderProps {
  title: string;
  description?: string;
  avatarName?: string;
  avatarImageUrl?: string;
  showAvatar?: boolean;
  isCreate?: boolean;
  className?: string;
}

export function FormHeader({
  title,
  description,
  avatarName,
  avatarImageUrl,
  showAvatar = false,
  isCreate = true,
  className,
}: FormHeaderProps) {

  const Icon = isCreate ? Plus : Edit;

  return (
    <DialogHeader
      className={cn("px-4 pt-4 pb-3 border-b flex-shrink-0", className)}
    >
      <div className="flex items-center gap-3">
        {}
        {showAvatar ? (
          <CustomAvatar size="xl" name={avatarName} imageUrl={avatarImageUrl} />
        ) : (
          <div className="p-2 bg-primary/10 border border-primary/30 rounded-md shrink-0">
            <Icon className="h-5 w-5 text-primary" strokeWidth={2.25} />
          </div>
        )}

        {}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <DialogTitle className="text-sm font-semibold leading-tight">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-xs leading-snug">
              {description}
            </DialogDescription>
          )}
        </div>
      </div>
    </DialogHeader>
  );
}
