"use client";

import React from "react";
import { TableImage } from "@/components/shared/table/table-image";

export interface CustomImagePreviewProps {
  src?: string;
  previewSrc?: string;
  alt?: string;
  fallbackText?: string;
  className?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  aspectRatio?: "1x1" | "square" | "auto" | "banner";
}

export function CustomImagePreview({
  src,
  previewSrc,
  alt = "Image preview",
  fallbackText,
  className = "h-12 w-12 rounded-xl aspect-square",
  priority,
  loading,
  aspectRatio = "1x1",
}: CustomImagePreviewProps) {
  return (
    <TableImage
      src={src}
      previewSrc={previewSrc || src}
      alt={alt}
      fallbackText={fallbackText}
      className={className}
      priority={priority}
      loading={loading}
      aspectRatio={aspectRatio}
    />
  );
}
