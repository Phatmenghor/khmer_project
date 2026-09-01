"use client";

import React, { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/shared/image/smart-image";
import { FieldError } from "react-hook-form";
import {
  uploadImage,
  uploadMultiSize,
  deleteImage,
  SpacesUploadResult,
  SpacesMultiSizeResult,
} from "@/services/spaces-service";

type AspectRatio = "square" | "banner" | "portrait" | "auto" | "1:1" | "16:9" | "4:3";
type UploadState = "idle" | "uploading" | "done" | "error";

interface BaseProps {
  label: string;
  businessId: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  error?: FieldError | string;
  maxSizeMb?: number;
  aspectRatio?: AspectRatio;
  height?: string;
  placeholder?: string;
  helperText?: string;
  onRemove?: () => void;
  /**
   * When true, picking a file does NOT call the Spaces API. The component
   * fires onFileSelected(file) with a local preview; the parent is
   * responsible for uploading on submit. Avoids orphaned uploads when the
   * user cancels the form.
   */
  deferred?: boolean;
  onFileSelected?: (file: File | null) => void;
}

interface SingleProps extends BaseProps {
  multiSize?: false;
  imageKey?: string;
  onChange?: (result: SpacesUploadResult) => void;
}

interface MultiProps extends BaseProps {
  multiSize: true;
  imageKeys?: SpacesMultiSizeResult;
  onChange?: (result: SpacesMultiSizeResult) => void;
}

type SpacesImageUploadProps = SingleProps | MultiProps;

export function SpacesImageUpload(props: SpacesImageUploadProps) {
  const {
    label,
    businessId,
    value,
    disabled = false,
    required = false,
    error,
    maxSizeMb = 5,
    aspectRatio = "square",
    height,
    placeholder = "Click to upload image",
    helperText,
    onRemove,
    deferred = false,
    onFileSelected,
  } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const containerHeight = height
    ? height
    : aspectRatio === "banner"
    ? "h-32"
    : aspectRatio === "auto"
    ? "h-44"
    : "h-40";

  const errorMessage =
    errorMsg ?? (typeof error === "string" ? error : error?.message ?? null);

  const deleteOldKeys = async () => {
    if (props.multiSize) {
      const keys = props.imageKeys;
      if (keys) {
        const all = [keys.sm?.key, keys.md?.key, keys.o?.key].filter(Boolean) as string[];
        await Promise.allSettled(all.map(deleteImage));
      }
    } else {
      if (props.imageKey) await deleteImage(props.imageKey).catch(() => {});
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select an image file");
      return;
    }
    if (file.size / 1024 / 1024 > maxSizeMb) {
      setErrorMsg(`Image must be under ${maxSizeMb}MB`);
      return;
    }

    setErrorMsg(null);

    if (deferred) {
      // No API call yet — hand the File to the parent for preview/upload-on-submit.
      onFileSelected?.(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    await deleteOldKeys();
    setUploadState("uploading");

    try {
      if (props.multiSize) {
        const result = await uploadMultiSize(file, businessId);
        setUploadState("done");
        props.onChange?.(result);
      } else {
        const result = await uploadImage(file, businessId);
        setUploadState("done");
        props.onChange?.(result);
      }
    } catch {
      setUploadState("error");
      setErrorMsg("Upload failed — please try again");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!deferred) await deleteOldKeys();
    setUploadState("idle");
    setErrorMsg(null);
    onFileSelected?.(null);
    onRemove?.();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClick = () => {
    if (!disabled && uploadState !== "uploading") {
      fileInputRef.current?.click();
    }
  };

  const isUploading = uploadState === "uploading";

  return (
    <div className="space-y-1">
      <Label className="text-xs font-semibold text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div
        onClick={handleClick}
        className={cn(
          "relative w-full rounded-[14px] overflow-hidden border-2 transition-all duration-300 group",
          containerHeight,
          value
            ? "border-border/80 shadow-2xs hover:border-primary/50"
            : "border-dashed border-primary/25 bg-muted/20 hover:bg-primary/5 hover:border-primary/60 shadow-2xs",
          disabled || isUploading
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:shadow-md",
          errorMessage && "border-destructive"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {isUploading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-background/85 backdrop-blur-xs">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-xs font-semibold text-foreground">
              {props.multiSize ? "Generating sizes…" : "Uploading…"}
            </p>
          </div>
        )}

        {value && !isUploading ? (
          <div className="relative w-full h-full group/overlay flex items-center justify-center p-1 bg-muted/10">
            <div className={cn(
              "relative rounded-[10px] overflow-hidden border border-border/50 shadow-2xs",
              aspectRatio === "square" ? "h-full aspect-square max-h-full" : "w-full h-full"
            )}>
              <SmartImage
                src={value}
                alt="Preview"
                fill
                showSkeleton={false}
                className="object-cover transition-transform duration-500 group-hover/overlay:scale-105"
              />

              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover/overlay:opacity-100 transition-all duration-300 flex items-center justify-center p-1">
                <div className="px-2 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-medium text-white flex items-center gap-1 shadow-md">
                  <Upload className="h-3 w-3" />
                  <span className="hidden sm:inline">Change</span>
                </div>
              </div>

              {!disabled && (
                <button
                  type="button"
                  className="absolute top-1 right-1 z-20 h-5 w-5 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive hover:scale-110 shadow-md transition-all flex items-center justify-center cursor-pointer"
                  onClick={handleRemove}
                  title="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        ) : !isUploading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-2">
            <div className="p-2 bg-primary/10 text-primary border border-primary/20 rounded-full shadow-2xs group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-300 shrink-0">
              <ImageIcon className="h-4 w-4" />
            </div>
            <div className="text-center w-full px-1 min-w-0">
              <p className="text-[10px] font-semibold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2 break-words">
                {placeholder}
              </p>
              <p className="text-[9px] text-muted-foreground/80 mt-0.5 font-normal hidden [@media(min-height:120px)]:block leading-tight line-clamp-1">
                {helperText ?? `PNG, JPG up to ${maxSizeMb}MB`}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {errorMessage && (
        <p className="text-xs text-destructive font-medium">{errorMessage}</p>
      )}
    </div>
  );
}
