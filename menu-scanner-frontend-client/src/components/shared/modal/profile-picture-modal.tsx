"use client";

import React, { useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Trash2,
  Download,
  X,
  Loader2,
} from "lucide-react";
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
    if (
      confirm(
        "Are you sure you want to remove your profile picture? This action cannot be undone."
      )
    ) {
      onImageRemove();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white flex items-center justify-between">
          <h2 className="text-lg font-semibold">Profile Picture</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Current/Selected Image Preview */}
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 flex items-center justify-center bg-gray-100">
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
            <p className="text-sm text-blue-600 font-medium">
              ✓ New image selected
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t p-6 space-y-3">
          {/* Select Picture */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Select Picture
              </>
            )}
          </Button>

          {/* Download Picture */}
          {currentImageUrl && (
            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full gap-2"
              disabled={isLoading}
            >
              <Download className="h-4 w-4" />
              Download Picture
            </Button>
          )}

          {/* Remove Picture */}
          {currentImageUrl && (
            <Button
              onClick={handleRemove}
              variant="outline"
              className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
              Remove Picture
            </Button>
          )}

          {/* Cancel */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
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
          className="hidden"
          onChange={handleFileSelect}
        />
      </DialogContent>
    </Dialog>
  );
}
