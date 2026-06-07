"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Trash2 } from "lucide-react";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { SpacesMultiSizeResult } from "@/services/spaces-service";

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl?: string;
  userName?: string;
  businessId: string;
  imageKeys?: SpacesMultiSizeResult;
  onUploaded: (result: SpacesMultiSizeResult) => void;
  onRemove: () => void;
  isLoading?: boolean;
}

export function ProfilePictureModal({
  isOpen,
  onClose,
  currentImageUrl,
  userName,
  businessId,
  imageKeys,
  onUploaded,
  onRemove,
  isLoading = false,
}: ProfilePictureModalProps) {
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || "");

  useEffect(() => {
    if (isOpen) setPreviewUrl(currentImageUrl || "");
  }, [isOpen, currentImageUrl]);

  const handleDownload = async () => {
    if (!currentImageUrl) return;
    try {
      const response = await fetch(currentImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${userName || "profile"}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // ignore download errors
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <DialogTitle asChild>
          <VisuallyHidden>Profile Picture Manager</VisuallyHidden>
        </DialogTitle>
        <DialogDescription asChild>
          <VisuallyHidden>Upload, download, or remove your profile picture</VisuallyHidden>
        </DialogDescription>

        <div className="px-4 py-3 border-b">
          <h2 className="text-xs font-semibold">Update Profile Picture</h2>
        </div>

        <div className="p-4 flex flex-col items-center gap-4">
          {/* Circle preview */}
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 flex-shrink-0">
            <CustomAvatar
              imageUrl={previewUrl}
              name={userName}
              size="xxl"
            />
          </div>

          {/* Spaces upload widget */}
          <div className="w-full">
            <SpacesImageUpload
              label="Choose Photo"
              businessId={businessId}
              multiSize
              value={previewUrl}
              imageKeys={imageKeys}
              aspectRatio="auto"
              height="h-28"
              placeholder="Click to upload a new photo"
              helperText="PNG, JPG up to 10MB — generates sm/md/lg sizes"
              onChange={(result) => {
                setPreviewUrl(result.md.url);
                onUploaded(result);
              }}
              onRemove={() => {
                setPreviewUrl("");
                onRemove();
              }}
            />
          </div>
        </div>

        <div className="border-t px-4 py-3 space-y-2">
          {currentImageUrl && (
            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full gap-1"
              disabled={isLoading}
            >
              <Download className="h-3 w-3" />
              Download
            </Button>
          )}

          {currentImageUrl && (
            <Button
              onClick={() => {
                setPreviewUrl("");
                onRemove();
              }}
              variant="outline"
              className="w-full gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
              disabled={isLoading}
            >
              <Trash2 className="h-3 w-3" />
              Remove Photo
            </Button>
          )}

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
