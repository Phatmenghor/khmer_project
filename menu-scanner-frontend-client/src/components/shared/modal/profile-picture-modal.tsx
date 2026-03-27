"use client";

import React, { useRef, useState } from "react";
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Camera,
  Trash2,
  Download,
  X,
  Loader2,
  Folder,
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
  const cameraInputRef = useRef<HTMLInputElement>(null);
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
    onImageRemove();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed z-50 grid w-full bg-background shadow-lg duration-200",
            "bottom-0 left-0 right-0 max-h-[92dvh] rounded-t-2xl border-t",
            "sm:bottom-auto sm:right-auto sm:left-1/2 sm:top-1/2",
            "sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md sm:rounded-xl sm:border",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
            "sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95",
            "sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=open]:slide-in-from-left-1/2",
            "sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-top-[48%]",
            "p-0 overflow-hidden"
          )}
        >
          <DialogTitle asChild>
            <VisuallyHidden>Profile Picture Manager</VisuallyHidden>
          </DialogTitle>
          <DialogDescription asChild>
            <VisuallyHidden>Upload, download, or remove your profile picture</VisuallyHidden>
          </DialogDescription>
        {/* Header */}
        <div className="bg-primary p-6 text-primary-foreground flex items-center justify-between">
          <h2 className="text-lg font-semibold">Profile Picture</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary/80"
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
          {/* Select Picture from Folder */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Folder className="h-4 w-4" />
                Select Photo
              </>
            )}
          </Button>

          {/* Open Camera */}
          <Button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            <Camera className="h-4 w-4" />
            Open Camera
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
              Download
            </Button>
          )}

          {/* Remove Picture */}
          {currentImageUrl && (
            <Button
              onClick={handleRemove}
              variant="outline"
              className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
              Remove
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

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
