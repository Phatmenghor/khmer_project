"use client";

import React, { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldError } from "react-hook-form";
import { getUserInfo } from "@/utils/local-storage/userInfo";
import {
  uploadAllSizes,
  uploadMultiSize,
  deleteImage,
  SpacesAllSizes,
  SpacesMultiSizeResult,
} from "@/services/spaces-service";

type AspectRatio = "square" | "banner" | "portrait" | "auto";
type UploadState = "idle" | "uploading" | "done" | "error";

interface BaseProps {
  label: string;
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
}

/** Legacy: 4 parallel calls, returns SpacesAllSizes */
interface AllSizesProps extends BaseProps {
  multiSize?: false;
  imageKeys?: Partial<SpacesAllSizes>;
  onChange: (result: SpacesAllSizes) => void;
}

/** New: single upload-multi request, returns SpacesMultiSizeResult — matches client project */
interface MultiSizeProps extends BaseProps {
  multiSize: true;
  imageKeys?: Partial<SpacesMultiSizeResult>;
  onChange: (result: SpacesMultiSizeResult) => void;
}

type SpacesImageUploadProps = AllSizesProps | MultiSizeProps;

export function SpacesImageUpload(props: SpacesImageUploadProps) {
  const {
    label,
    value,
    disabled = false,
    required = false,
    error,
    maxSizeMb = 10,
    aspectRatio = "square",
    height,
    placeholder = "Click to upload image",
    helperText,
    onRemove,
  } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
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
      const keys = props.imageKeys;
      if (keys) {
        const all = Object.values(keys).map((r) => r?.key).filter(Boolean) as string[];
        await Promise.allSettled(all.map(deleteImage));
      }
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
      setErrorMsg(`File must be under ${maxSizeMb}MB`);
      return;
    }

    const businessId = getUserInfo()?.businessId;
    if (!businessId) {
      setErrorMsg("Business not found — please log in again");
      return;
    }

    await deleteOldKeys();
    setErrorMsg(null);
    setUploadState("uploading");
    setProgress(0);

    try {
      if (props.multiSize) {
        const result = await uploadMultiSize(file, businessId);
        setUploadState("done");
        (props as MultiSizeProps).onChange(result);
      } else {
        const result = await uploadAllSizes(file, businessId, (done, total) => {
          setProgress(Math.round((done / total) * 100));
        });
        setUploadState("done");
        (props as AllSizesProps).onChange(result);
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
    await deleteOldKeys();
    setUploadState("idle");
    setProgress(0);
    setErrorMsg(null);
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
          "relative w-full rounded overflow-hidden border-2 transition-all",
          containerHeight,
          value
            ? "border-border hover:border-primary/50"
            : "border-dashed border-border hover:border-primary",
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

        {/* Uploading overlay */}
        {isUploading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-background/80">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs font-medium text-foreground">
              {props.multiSize ? "Generating sizes…" : `Uploading… ${progress}%`}
            </p>
            {!props.multiSize && (
              <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Preview */}
        {value && !isUploading ? (
          <>
            {aspectRatio === "square" ? (
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
              <div className="opacity-0 group-hover/overlay:opacity-100 transition-opacity flex flex-col items-center gap-1 text-white">
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
        ) : !isUploading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-muted/30">
            <div className="p-3 bg-muted rounded-full">
              <ImageIcon className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="text-center px-3">
              <p className="text-xs font-medium text-foreground">
                {placeholder}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {helperText ?? `PNG, JPG, WebP up to ${maxSizeMb}MB`}
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
