"use client";

import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Trash2,
  Download,
  Loader2,
} from "lucide-react";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
  const [inputType, setInputType] = useState<"file" | "camera" | null>(null);

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
      onImageSelect(imageData);
      setTimeout(() => onClose(), 500);
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
    } catch (error) {
      console.error("Failed to download image:", error);
      alert("Failed to download image");
    }
  };

  const handleRemove = () => {
    onImageRemove();
    onClose();
  };

  const handleUploadClick = (type: "file" | "camera") => {
    setInputType(type);
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden flex flex-col"
        closeButtonClassName="text-white hover:bg-white/10"
      >
        <DialogTitle asChild>
          <VisuallyHidden>Profile Picture Manager</VisuallyHidden>
        </DialogTitle>
        <DialogDescription asChild>
          <VisuallyHidden>Upload, download, or remove your profile picture</VisuallyHidden>
        </DialogDescription>

        {/* Header */}
        <div className="bg-primary px-6 py-4 text-white">
          <h2 className="text-lg font-semibold">Update Profile Picture</h2>
        </div>

        {/* Body - Image Preview */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center gap-4">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 flex items-center justify-center bg-gray-100 shadow-sm">
            {selectedImage || currentImageUrl ? (
              <img
                src={selectedImage || currentImageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <CustomAvatar
                imageUrl={currentImageUrl}
                name={userName}
                size="xl"
              />
            )}
          </div>

          {selectedImage && selectedImage !== currentImageUrl && (
            <p className="text-sm text-green-600 font-medium">
              ✓ New image selected
            </p>
          )}
        </div>

        {/* Footer - Action Buttons */}
        <div className="border-t border-gray-200 px-6 py-4 space-y-2.5">
          {/* Combined Upload Button */}
          <button
            onClick={() => handleUploadClick("file")}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Change Photo
              </>
            )}
          </button>

          {/* Download and Remove Buttons Row */}
          {currentImageUrl && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1 gap-2 text-sm"
                disabled={isLoading}
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                onClick={handleRemove}
                variant="outline"
                className="flex-1 gap-2 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
          )}

          {/* Cancel Button */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full text-sm"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture={inputType === "camera" ? "environment" : undefined}
          className="hidden"
          onChange={handleFileSelect}
        />
      </DialogContent>
    </Dialog>
  );
}
