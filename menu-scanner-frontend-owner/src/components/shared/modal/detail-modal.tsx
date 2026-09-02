"use client";

import { CustomModal, type ModalSize } from "./custom-modal";
import type React from "react";
import { ReactNode } from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { CustomImagePreview } from "@/components/shared/image/custom-image-preview";
import { Loading } from "../common/loading";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  avatarUrl?: string;
  imageUrl?: string;
  avatarName?: string;
  badges?: ReactNode;
  icon?: React.ElementType;
  maxWidthClass?: string;
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
  imageUrl,
  avatarName,
  badges,
  size = "6xl",
  isEmpty = false,
  emptyMessage = "No data available",
  children,
}: DetailModalProps) {
  const displayImage = avatarUrl || imageUrl;
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      className="max-h-[92vh] gap-0 flex flex-col"
      disableScrollWrapper={true}
    >
      <DialogHeader className="px-4 py-3 border-b border-border/60 m-0 bg-muted/30 flex-shrink-0">
        <div className="flex items-center gap-3 pr-4">
          {displayImage ? (
            <CustomImagePreview
              src={displayImage}
              alt={avatarName || title}
              fallbackText={avatarName}
              className="h-10 w-10 rounded-[10px]"
            />
          ) : avatarName ? (
            <CustomAvatar name={avatarName} size="lg" />
          ) : null}

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

      <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[50vh] w-full flex-1">
            <Loading />
          </div>
        ) : isEmpty ? (
          <div className="flex items-center justify-center min-h-[50vh] w-full flex-1">
            <p className="text-xs text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </CustomModal>
  );
}
