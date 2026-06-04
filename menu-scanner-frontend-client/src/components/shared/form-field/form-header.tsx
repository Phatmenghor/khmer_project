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
      <div className="flex items-start gap-3">
        {}
        {showAvatar ? (
          <CustomAvatar size="xl" name={avatarName} imageUrl={avatarImageUrl} />
        ) : (
          <div className="p-2 bg-primary/10 border border-primary rounded shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}

        {}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <DialogTitle className="text-xs font-semibold">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-xs">
              {description}
            </DialogDescription>
          )}
        </div>
      </div>
    </DialogHeader>
  );
}
