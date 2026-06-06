"use client";

import React, { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldError } from "react-hook-form";

type AspectRatio = "square" | "banner" | "portrait" | "landscape" | "auto" | "video";

interface ClickableImageUploadProps {
  label: string;
  value?: string;
  onChange: (base64: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: FieldError;
  maxSize?: number;
  aspectRatio?: AspectRatio;
  height?: string;
  width?: string;
  placeholder?: string;
  helperText?: string;
  showPreviewText?: boolean;
}

export function ClickableImageUpload({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  maxSize = 10,
  aspectRatio = "square",
  height,
  width,
  placeholder = "Click to upload image",
  helperText,
  showPreviewText = true,
}: ClickableImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getContainerHeight = () => {
    if (height) return height;
    if (aspectRatio === "banner") return "h-32";
    if (aspectRatio === "auto") return "h-44";
    if (aspectRatio === "square") return "h-40";
    return "h-40";
  };

  const getContainerWidth = () => {
    if (width) return width;
    return "w-full";
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      onChange(base64);
    } catch (error) {
      alert("Failed to read image. Please try again.");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const isSquare = aspectRatio === "square" && !height;

  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="space-y-2">
        <div
          onClick={handleClick}
          className={cn(
            "relative rounded overflow-hidden border-2 transition-all",
            getContainerHeight(),
            getContainerWidth(),
            value
              ? "border-border hover:border-primary/50"
              : "border-dashed border-border hover:border-primary",
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:shadow-md",
            error && "border-red-500",
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />

          {value ? (
            <>
              {isSquare ? (
                <div className="w-full h-full flex items-center justify-center bg-muted/10">
                  <div className="w-40 h-40 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={value}
                      alt="Preview"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              ) : (
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              )}

              <div className="absolute inset-0 group/overlay bg-black/0 hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover/overlay:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-1 text-white">
                  <Upload className="h-5 w-5" />
                  <p className="text-xs font-medium">Click to change</p>
                </div>
              </div>

              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={handleRemove}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-muted/30">
              <div className="p-3 bg-muted rounded-full">
                <ImageIcon className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="text-center px-3">
                <p className="text-xs font-medium text-foreground">
                  {placeholder}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {helperText || `PNG, JPG, GIF up to ${maxSize}MB`}
                </p>
              </div>
            </div>
          )}
        </div>

        {value && !disabled && showPreviewText && (
          <p className="text-xs text-muted-foreground text-center">
            Click on the image to change it
          </p>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
