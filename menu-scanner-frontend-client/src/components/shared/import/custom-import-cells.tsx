"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { AppDefault } from "@/constants/app-resource/default/default";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

/**
 * Reusable Custom Input Cell using standard UI Input component from form fields
 */
export function CustomInputCell({
  value,
  onChange,
  disabled = false,
  placeholder,
  hasError = false,
  errorMessage,
  isDecimalOnly = false,
  className = "",
}: {
  value?: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
  hasError?: boolean;
  errorMessage?: string;
  isDecimalOnly?: boolean;
  className?: string;
}) {
  const isErr = hasError || !!errorMessage;

  const inputEl = (
    <Input
      type="text"
      inputMode={isDecimalOnly ? "decimal" : "text"}
      value={value || ""}
      onChange={(e) => {
        const val = isDecimalOnly ? e.target.value.replace(/[^0-9.]/g, "") : e.target.value;
        onChange(val);
      }}
      disabled={disabled}
      placeholder={placeholder}
      className={cn(
        "h-8 text-xs font-medium rounded-[8px] px-2.5 bg-muted/30 border border-border/80 hover:bg-muted/50 hover:border-border focus:bg-background transition-all",
        isErr && "border-red-500 bg-red-500/5 focus:border-red-500 focus:ring-red-500/25",
        className
      )}
    />
  );

  if (!errorMessage) {
    return inputEl;
  }

  return (
    <div className="flex flex-col w-full">
      {inputEl}
      <span className="text-[10px] font-semibold text-red-500 mt-0.5 px-0.5 leading-tight truncate">
        {errorMessage}
      </span>
    </div>
  );
}

/**
 * Reusable Single Main Image Cell for Generic Excel Import tables (1x1 Square w-11 h-11)
 */
export function MainImageCell({
  file,
  onChange,
  disabled = false,
  placeholder = "Main",
}: {
  file?: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="w-11 h-11 flex-shrink-0 flex items-center justify-center">
      <SpacesImageUpload
        label=""
        businessId={AppDefault.BUSINESS_ID}
        value={previewUrl}
        disabled={disabled}
        height="h-11 w-11"
        aspectRatio="square"
        placeholder={placeholder}
        deferred={true}
        onFileSelected={(f) => onChange(f)}
        onRemove={() => onChange(null)}
      />
    </div>
  );
}

/**
 * Reusable Multi-Image Cover Gallery Cell (Max N slots, 1x1 Square w-11 h-11)
 * Supports multi-selecting multiple files at once.
 */
export function CoverGalleryCell({
  images,
  onChange,
  disabled = false,
  maxCount = 5,
  placeholder = "Gallery",
}: {
  images?: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  maxCount?: number;
  placeholder?: string;
}) {
  const activeFiles = images || [];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const combined = [...activeFiles, ...selectedFiles];
      onChange(combined.slice(0, maxCount));
    }
    e.target.value = "";
  };

  const handleUpdateSlot = (index: number, newFile: File | null) => {
    if (!newFile) {
      const updated = activeFiles.filter((_, i) => i !== index);
      onChange(updated);
    } else {
      const updated = [...activeFiles];
      updated[index] = newFile;
      onChange(updated.slice(0, maxCount));
    }
  };

  return (
    <div className="flex items-center gap-1.5 py-0.5 max-w-[300px] overflow-x-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {activeFiles.map((file, idx) => {
        const previewUrl = URL.createObjectURL(file);
        return (
          <div key={idx} className="w-11 h-11 flex-shrink-0 flex items-center justify-center">
            <SpacesImageUpload
              label=""
              businessId={AppDefault.BUSINESS_ID}
              value={previewUrl}
              disabled={disabled}
              height="h-11 w-11"
              aspectRatio="square"
              deferred={true}
              onFileSelected={(f) => handleUpdateSlot(idx, f)}
              onRemove={() => handleUpdateSlot(idx, null)}
            />
          </div>
        );
      })}

      {!disabled && activeFiles.length < maxCount && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="w-11 h-11 flex-shrink-0 border border-dashed border-border hover:border-primary hover:bg-primary/5 rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-all cursor-pointer"
          title="Click to multi-select gallery images"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[9px] font-semibold mt-0.5 leading-none">{placeholder}</span>
        </button>
      )}
    </div>
  );
}
