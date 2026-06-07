"use client";

import type React from "react";
import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Loading from "@/components/shared/common/loading";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  /** Image URL — rendered as the 12x12 image tile on the left of the header. */
  imageUrl?: string;
  /**
   * Alias for imageUrl. Kept so callers passing `avatarUrl` (the original
   * DetailModal prop) keep working.
   */
  avatarUrl?: string;
  /** Used as alt text and as the avatar fallback letter. */
  avatarName?: string;
  /** Icon shown inside the image tile when no image is provided. Defaults to Eye. */
  icon?: LucideIcon;
  badges?: ReactNode;
  /** Override the max-width. Default is sm:max-w-5xl (matches client modals). */
  maxWidthClass?: string;
  children: ReactNode;
}

/**
 * Standard detail-modal shell.
 * Header matches the client project pattern: a 12×12 rounded image tile
 * on the left (image OR fallback icon), then a text-sm font-bold title
 * with a text-xs muted description underneath.
 */
export function DetailModal({
  isOpen,
  onClose,
  isLoading = false,
  title = "Details",
  description,
  imageUrl,
  avatarUrl,
  avatarName,
  icon: Icon = Eye,
  badges,
  maxWidthClass = "sm:max-w-5xl",
  children,
}: DetailModalProps) {
  const image = imageUrl || avatarUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          // Fixed height so the inner flex-1 ScrollArea actually scrolls.
          "w-full h-[92dvh] max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden",
          maxWidthClass,
        )}
      >
        <DialogHeader className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* 12x12 image tile — matches client modal header pattern */}
            <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-muted border border-border/50 flex items-center justify-center">
              {image ? (
                <img
                  src={image}
                  alt={avatarName || title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icon
                  className="h-5 w-5 text-muted-foreground"
                  strokeWidth={2}
                />
              )}
            </div>

            <div className="flex flex-col gap-0.5 flex-1 min-w-0 text-left">
              <DialogTitle className="text-sm font-bold text-foreground leading-tight truncate">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-xs text-muted-foreground leading-snug truncate">
                  {description}
                </DialogDescription>
              )}
              {badges && (
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {badges}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <Loading />
              </div>
            ) : (
              children
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
