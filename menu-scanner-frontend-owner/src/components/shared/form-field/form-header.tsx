"use client";

import React from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { ImageTile } from "@/components/shared/avatar/image-tile";
import { Plus, Edit, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FormHeaderVariant = "default" | "destructive";

interface FormHeaderProps {
  title: string;
  description?: string;
  /**
   * Optional image URL. Pair with `useImageTile` (or just pass
   * `imageUrl` — its presence implies `useImageTile`). When the image
   * is missing the tile falls back to the icon.
   */
  imageUrl?: string;
  /**
   * Force the 12×12 image tile even when imageUrl is not yet loaded
   * (e.g. while fetching). The tile shows the icon as a fallback so
   * the layout doesn't jump when the URL arrives.
   */
  useImageTile?: boolean;
  /** Alt text + fallback for the image tile. */
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
  imageUrl,
  useImageTile,
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

  // Resolve the image tile: explicit imageUrl wins, then avatarImageUrl
  // (legacy prop). Used to decide between image and icon fallback.
  const tileImage = imageUrl || avatarImageUrl;
  // Render the 12×12 tile when the caller explicitly asks for it,
  // when they pass imageUrl, or when they opted into the legacy
  // showAvatar path with a real image URL.
  const showImageTile =
    !!useImageTile || !!imageUrl || (showAvatar && !!avatarImageUrl);
  const showLegacyAvatar = showAvatar && !imageUrl && !useImageTile;

  return (
    <DialogHeader
      className={cn("px-3 pt-3 pb-2 border-b flex-shrink-0", className)}
    >
      <div className="flex items-center gap-2">
        {showLegacyAvatar ? (
          // Legacy avatar path — still supported for callers that want
          // initials when the record has no image.
          <CustomAvatar size="xl" name={avatarName} imageUrl={avatarImageUrl} />
        ) : showImageTile ? (
          // 12×12 image tile — image opens a click-to-zoom preview when present
          <ImageTile
            imageUrl={tileImage}
            name={avatarName || title}
            icon={Icon}
          />
        ) : (
          // Small admin-modal icon tile (no image expected).
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
