"use client";

import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomModal } from "./custom-modal";
import React, { useEffect, useRef, useState } from "react";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Camera, Download, Trash2, UserCheck } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { SmartImage } from "@/components/shared/image/smart-image";
import { uploadMultiSize, uploadMultiSizeCustomer, SpacesMultiSizeResult } from "@/services/spaces-service";

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl?: string;
  userName?: string;
  businessId?: string;
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
  onUploaded,
  onRemove,
  isLoading = false,
}: ProfilePictureModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPreviewUrl(currentImageUrl || "");
      setSelectedFile(null);
      setIsRemoving(false);
    }
  }, [isOpen, currentImageUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size / 1024 / 1024 > 5) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsRemoving(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (isRemoving) {
      onRemove();
      return;
    }
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const result = businessId
        ? await uploadMultiSize(selectedFile, businessId)
        : await uploadMultiSizeCustomer(selectedFile);
      onUploaded(result);
    } catch {
      // error handled by parent
    } finally {
      setIsUploading(false);
    }
  };

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
      // ignore
    }
  };

  const hasChanges = !!selectedFile || isRemoving;
  const busy = isUploading || isLoading;

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="sm">
      <DialogTitle asChild>
        <VisuallyHidden>Profile Picture Manager</VisuallyHidden>
      </DialogTitle>
      <DialogDescription asChild>
        <VisuallyHidden>Upload, download, or remove your profile picture</VisuallyHidden>
      </DialogDescription>

      {/* ── Fixed Header ── */}
      <div className="flex items-center gap-3 p-4 px-5 border-b border-border/80 bg-background shrink-0">
        <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
          <Camera className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-base text-foreground leading-tight">Update Profile Picture</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Upload or manage your avatar image</p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 flex flex-col items-center gap-4 bg-card/30">
        {/* Circle preview with floating remove trash button stacked on bottom-right of avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="relative group cursor-pointer w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary/20 flex-shrink-0 bg-primary/10 flex items-center justify-center shadow-md transition-all hover:ring-primary/40"
            onClick={() => fileInputRef.current?.click()}
            title="Click to choose image"
          >
            {previewUrl && !isRemoving ? (
              <SmartImage
                src={previewUrl}
                alt={userName || "Profile"}
                fill
                rounded="full"
              />
            ) : (
              <span className="text-3xl font-extrabold text-primary/60 select-none">
                {userName?.charAt(0)?.toUpperCase() || "U"}
              </span>
            )}
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera className="h-6 w-6 text-white mb-1" />
              <span className="text-[10px] text-white font-bold uppercase tracking-wider">Change</span>
            </div>
          </div>

          {/* Floating Trash Action Button Stacked on Avatar Bottom-Right */}
          {(currentImageUrl || selectedFile) && !isRemoving && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsRemoving(true);
                setPreviewUrl("");
                setSelectedFile(null);
              }}
              disabled={busy}
              title="Remove profile picture"
              className="absolute bottom-0 right-0 p-2 rounded-full bg-destructive text-white shadow-md hover:bg-destructive/90 transition-all hover:scale-110 active:scale-95 z-20 border-2 border-background"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {selectedFile && (
          <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            <span>New photo selected — click Save to apply</span>
          </div>
        )}
        {isRemoving && (
          <div className="px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Photo will be removed — click Save to apply</span>
          </div>
        )}

        {/* Toolbar Action Buttons (Upload & Download) */}
        <div className="grid grid-cols-2 gap-2 w-full pt-1">
          <CustomButton
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="gap-1.5 font-bold text-xs h-9 rounded-xl border-border/80 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <Camera className="h-3.5 w-3.5 text-primary" />
            Upload New
          </CustomButton>

          {currentImageUrl ? (
            <CustomButton
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={busy}
              className="gap-1.5 font-bold text-xs h-9 rounded-xl border-border/80 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-primary" />
              Download
            </CustomButton>
          ) : (
            <CustomButton
              type="button"
              variant="outline"
              size="sm"
              disabled={true}
              className="gap-1.5 font-bold text-xs h-9 rounded-xl border-border/40 bg-muted/20 text-muted-foreground/50 cursor-not-allowed opacity-60"
            >
              <Download className="h-3.5 w-3.5 text-muted-foreground/40" />
              Download
            </CustomButton>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="p-4 px-5 border-t border-border/80 bg-background flex items-center justify-end gap-2 shrink-0">
        <CustomButton
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={busy}
          className="font-bold min-w-[80px] rounded-xl"
        >
          Cancel
        </CustomButton>

        <CustomButton
          type="button"
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={busy || !hasChanges}
          isLoading={busy}
          className="font-bold min-w-[110px] rounded-xl"
        >
          {isUploading ? "Saving..." : "Save Changes"}
        </CustomButton>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </CustomModal>
  );
}
