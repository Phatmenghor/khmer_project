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
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { Loading } from "../common/loading";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  avatarUrl?: string;
  avatarName?: string;
  badges?: ReactNode;
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
  badges,
  children,
}: DetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full sm:max-w-6xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {}
        <DialogHeader className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-3 pr-5">
            {(avatarUrl || avatarName) && (
              <CustomAvatar imageUrl={avatarUrl} name={avatarName} size="xl" />
            )}

            <div className="flex-1">
              <DialogTitle className="text-xs font-semibold">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-xs text-muted-foreground">
                  {description}
                </DialogDescription>
              )}
              {badges && (
                <div className="flex items-center gap-1.5 mt-1.5">{badges}</div>
              )}
            </div>
          </div>
        </DialogHeader>

        {}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">{isLoading ? <Loading /> : children}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
