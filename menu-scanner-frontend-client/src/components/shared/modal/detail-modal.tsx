"use client";

import { CustomModal, type ModalSize } from "./custom-modal";
import type React from "react";
import { ReactNode } from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  size?: ModalSize;
  isEmpty?: boolean;
  emptyMessage?: string;
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
  size = "6xl",
  isEmpty = false,
  emptyMessage = "No data available",
  children,
}: DetailModalProps) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      className="max-h-[92vh] gap-0 flex flex-col"
      disableScrollWrapper={true}
    >
      <DialogHeader className="p-4 border-b border-primary/30 m-0 mx-0 mt-0 bg-muted/30 flex-shrink-0">
        <div className="flex items-center gap-2 pr-4">
          {(avatarUrl || avatarName) && (
            <CustomAvatar imageUrl={avatarUrl} name={avatarName} size="xl" />
          )}

          <div className="flex-1 min-w-0 text-left">
            <DialogTitle className="text-sm md:text-base font-semibold leading-tight text-foreground truncate">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-xs text-muted-foreground leading-snug truncate">
                {description}
              </DialogDescription>
            )}
            {badges && (
              <div className="flex items-center gap-1 mt-1">{badges}</div>
            )}
          </div>
        </div>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto px-4">
        <div className="py-3 px-0.5">
          {isLoading ? (
            <Loading />
          ) : isEmpty ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-xs text-muted-foreground">{emptyMessage}</p>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </CustomModal>
  );
}
