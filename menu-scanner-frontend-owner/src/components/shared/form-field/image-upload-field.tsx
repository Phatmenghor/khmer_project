"use client";

import React from "react";
import { ClickableImageUpload } from "./clickable-image-upload";

interface ImageUploadFieldProps {
  label: string;
  value?: string;
  onChange: (base64: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
  accept?: string;
  maxSize?: number;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  className = "",
  maxSize = 5,
}: ImageUploadFieldProps) {
  return (
    <div className={className}>
      <ClickableImageUpload
        label={label}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        error={error ? ({ message: error } as any) : undefined}
        maxSize={maxSize}
      />
    </div>
  );
}
