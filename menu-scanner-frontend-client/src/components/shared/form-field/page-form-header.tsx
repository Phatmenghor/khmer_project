"use client";

import React from "react";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { Plus, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageFormHeaderProps {
  title: string;
  description?: string;
  avatarName?: string;
  avatarImageUrl?: string;
  showAvatar?: boolean;
  isCreate?: boolean;
  className?: string;
}

export function PageFormHeader({
  title,
  description,
  avatarName,
  avatarImageUrl,
  showAvatar = false,
  isCreate = true,
  className,
}: PageFormHeaderProps) {
  // Determine icon based on mode
  const Icon = isCreate ? Plus : Edit;

  return (
    <div
      className={cn("px-6 pt-6 pb-4 border-b flex-shrink-0 bg-white rounded-lg", className)}
    >
      <div className="flex items-start gap-4">
        {/* Avatar or Icon - Left side */}
        {showAvatar ? (
          <CustomAvatar size="xl" name={avatarName} imageUrl={avatarImageUrl} />
        ) : (
          <div className="p-3 bg-brand-100 rounded-lg shrink-0">
            <Icon className="h-6 w-6 text-brand-600" />
          </div>
        )}

        {/* Header Content */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <h1 className="text-xl font-semibold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
