"use client";

import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Trash2, Download, Loader2 } from "lucide-react";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl?: string;
  userName?: string;
  onImageSelect: (imageData: string) => void;
  onImageRemove: () => void;
  isLoading?: boolean;
}

export function ProfilePictureModal({
  isOpen,
  onClose,
  currentImageUrl,
  userName,
  onImageSelect,
  onImageRemove,
  isLoading = false,
}: ProfilePictureModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string>(currentImageUrl || "");
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedImage(currentImageUrl || "");
      setIsRemoving(false);
    }
  }, [isOpen, currentImageUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      alert("File size must be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setSelectedImage(imageData);
      setIsRemoving(false);
    };
    reader.readAsDataURL(file);
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
      alert("Failed to download image");
    }
  };

  const handleRemoveClick = () => {
    setIsRemoving(true);
    setSelectedImage("");
  };

  const hasChanges =
    (selectedImage !== currentImageUrl && selectedImage !== "") || isRemoving;

  const handleSave = () => {
    if (isRemoving) {
      onImageRemove();
    } else if (selectedImage && selectedImage !== currentImageUrl) {
      onImageSelect(selectedImage);
    }
  };

  const handleCancel = () => {
    setSelectedImage(currentImageUrl || "");
    setIsRemoving(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <DialogTitle className="sr-only">Update Profile Picture</DialogTitle>
        <DialogDescription className="sr-only">Upload, download, or remove your profile picture</DialogDescription>

        <div className="px-4 py-3 border-b">
          <h2 className="text-xs font-semibold">Update Profile Picture</h2>
        </div>

        <div className="p-4 flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 flex items-center justify-center bg-gray-100">
            {selectedImage || currentImageUrl ? (
              <img
                src={selectedImage || currentImageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <CustomAvatar imageUrl={currentImageUrl} name={userName} size="xl" />
            )}
          </div>

          {selectedImage && selectedImage !== currentImageUrl && (
            <p className="text-xs text-blue-600 font-medium">New image selected</p>
          )}
        </div>

        <div className="border-t px-4 py-3 space-y-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full gap-1 bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Camera className="h-3 w-3" />
                Select Photo
              </>
            )}
          </Button>

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

          {currentImageUrl && !isRemoving && (
            <Button
              onClick={handleRemoveClick}
              variant="outline"
              className="w-full gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
              disabled={isLoading}
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </Button>
          )}

          <div className="flex gap-1 pt-1">
            <Button onClick={handleCancel} variant="outline" className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !hasChanges} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
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
