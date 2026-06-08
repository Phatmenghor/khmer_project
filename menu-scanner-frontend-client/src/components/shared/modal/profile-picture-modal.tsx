"use client";

import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Download, Loader2, Trash2 } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
          <div
            className="relative group cursor-pointer w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 flex-shrink-0 bg-primary/10 flex items-center justify-center"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl && !isRemoving ? (
              <img src={previewUrl} alt={userName || "Profile"} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-primary/60 select-none">
                {userName?.charAt(0)?.toUpperCase() || "?"}
              </span>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
              <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {selectedFile && (
            <p className="text-xs text-primary font-medium">New photo selected — click Save to apply</p>
          )}
          {isRemoving && (
            <p className="text-xs text-destructive font-medium">Photo will be removed — click Save to apply</p>
          )}
        </div>

        <div className="border-t px-4 py-3 space-y-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full gap-1 bg-primary hover:bg-primary/90"
            disabled={busy}
          >
            <Camera className="h-3 w-3" />
            Select Photo
          </Button>

          {currentImageUrl && (
            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full gap-1"
              disabled={busy}
            >
              <Download className="h-3 w-3" />
              Download
            </Button>
          )}

          {currentImageUrl && !isRemoving && (
            <Button
              onClick={() => { setIsRemoving(true); setPreviewUrl(""); setSelectedFile(null); }}
              variant="outline"
              className="w-full gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
              disabled={busy}
            >
              <Trash2 className="h-3 w-3" />
              Remove Photo
            </Button>
          )}

          <div className="flex gap-2 pt-1">
            <Button onClick={onClose} variant="outline" className="flex-1" disabled={busy}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1" disabled={busy || !hasChanges}>
              {isUploading ? (
                <><Loader2 className="h-3 w-3 animate-spin mr-1" />Saving...</>
              ) : "Save"}
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </DialogContent>
    </Dialog>
  );
}
