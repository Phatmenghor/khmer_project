"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { AppDefault } from "@/constants/app-resource/default/default";
import { cn } from "@/lib/utils";

/**
 * Reusable Custom Input Cell using standard UI Input component from form fields
 */
export function CustomInputCell({
  value,
  onChange,
  disabled = false,
  placeholder,
  hasError = false,
  isDecimalOnly = false,
  className = "",
}: {
  value?: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
  hasError?: boolean;
  isDecimalOnly?: boolean;
  className?: string;
}) {
  return (
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
        hasError && "border-red-500 bg-red-500/5 focus:border-red-500 focus:ring-red-500/25",
        className
      )}
    />
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

  const handleAddSlot = (newFile: File | null) => {
    if (!newFile) return;
    if (activeFiles.length < maxCount) {
      onChange([...activeFiles, newFile]);
    }
  };

  return (
    <div className="flex items-center gap-1.5 py-0.5 max-w-[300px] overflow-x-auto">
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
        <div className="w-11 h-11 flex-shrink-0 flex items-center justify-center">
          <SpacesImageUpload
            label=""
            businessId={AppDefault.BUSINESS_ID}
            value={undefined}
            disabled={disabled}
            height="h-11 w-11"
            aspectRatio="square"
            placeholder={placeholder}
            deferred={true}
            onFileSelected={(f) => handleAddSlot(f)}
          />
        </div>
      )}
    </div>
  );
}
