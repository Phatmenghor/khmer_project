"use client";

import React, { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldError } from "react-hook-form";

type AspectRatio = "square" | "banner" | "portrait" | "landscape" | "auto";

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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
    } catch {
      alert("Failed to read image. Please try again.");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("Failed to convert file to base64"));
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClick = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  const isSquare = aspectRatio === "square" && !height;

  return (
    <div className="space-y-1">
      <Label className="text-xs sm:text-xs font-semibold text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className="space-y-2">
        <div
          onClick={handleClick}
          className={cn(
            "relative rounded-[14px] overflow-hidden border-2 transition-all duration-300 group",
            getContainerHeight(),
            getContainerWidth(),
            value
              ? "border-border/80 shadow-2xs hover:border-primary/50"
              : "border-dashed border-primary/25 bg-muted/20 hover:bg-primary/5 hover:border-primary/60 shadow-2xs",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md",
            error && "border-destructive",
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
            <div className="relative w-full h-full group/overlay">
              {isSquare ? (
                <div className="w-full h-full flex items-center justify-center bg-muted/10">
                  <div className="w-36 h-36 rounded-[10px] overflow-hidden flex-shrink-0 border border-border/50">
                    <img
                      src={value}
                      alt="Preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/overlay:scale-105"
                    />
                  </div>
                </div>
              ) : (
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/overlay:scale-105"
                />
              )}

              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover/overlay:opacity-100 transition-all duration-300 flex items-center justify-center">
                <div className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-medium text-white flex items-center gap-1.5 shadow-md">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Click to change image</span>
                </div>
              </div>

              {!disabled && (
                <button
                  type="button"
                  className="absolute top-2.5 right-2.5 z-20 h-7 w-7 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive hover:scale-110 shadow-md transition-all flex items-center justify-center"
                  onClick={handleRemove}
                  title="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2.5 p-4">
              <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-full shadow-2xs group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-300">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div className="text-center px-3">
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{placeholder}</p>
                <p className="text-[11px] text-muted-foreground/80 mt-0.5 font-normal">
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

      {error && <p className="text-xs text-destructive font-medium">{error.message}</p>}
    </div>
  );
}
