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
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import Loading from "@/components/shared/common/loading";
import { Eye, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  avatarUrl?: string;
  avatarName?: string;
  /** Optional icon when no avatar is provided. Defaults to Eye. */
  icon?: LucideIcon;
  badges?: ReactNode;
  /** Override the max-width. Default is sm:max-w-4xl. */
  maxWidthClass?: string;
  children: ReactNode;
}

export function DetailModal({
  isOpen,
  onClose,
  isLoading = false,
  title = "Details",
  description,
  avatarUrl,
  avatarName,
  icon: Icon = Eye,
  badges,
  maxWidthClass = "sm:max-w-4xl",
  children,
}: DetailModalProps) {
  const hasAvatar = !!(avatarUrl || avatarName);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          // Fixed height (not max-only) so the flex-1 ScrollArea actually
          // gets remaining space. max-h is kept as a safety cap.
          "w-full h-[92dvh] max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden",
          maxWidthClass,
        )}
      >
        <DialogHeader className="px-3 pt-3 pb-2 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-2 pr-4">
            {hasAvatar ? (
              <CustomAvatar imageUrl={avatarUrl} name={avatarName} size="xl" />
            ) : (
              <div className="p-1.5 border border-primary/30 bg-primary/10 rounded shrink-0">
                <Icon
                  className="h-4 w-4 text-primary"
                  strokeWidth={2.25}
                />
              </div>
            )}

            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <DialogTitle className="text-xs font-semibold leading-tight">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-[11px] text-muted-foreground leading-snug truncate">
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
            {isLoading ? <Loading /> : children}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
