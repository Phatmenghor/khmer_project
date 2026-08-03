"use client";

import React, { useState } from "react";
import {
  Eye,
  Download,
  X,
  MoreHorizontal,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { CustomButton } from "@/components/shared/button/custom-button";
import { SmartImage } from "@/components/shared/image/smart-image";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TableImageProps {
  src?: string;
  previewSrc?: string;
  alt?: string;
  fallbackText?: string;
  className?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
}

export function TableImage({
  src,
  previewSrc,
  alt = "Image",
  fallbackText,
  className = "h-9 w-9",
  priority,
  loading,
}: TableImageProps) {
  const [viewOpen, setViewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [thumbErrored, setThumbErrored] = useState(false);
  const [previewErrored, setPreviewErrored] = useState(false);
  const effectivePreview = previewSrc || src;

  const handleDownload = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const target = effectivePreview;
    if (!target || isDownloading) return;
    setIsDownloading(true);
    try {
      const downloadUrl = `/api/download?url=${encodeURIComponent(target)}`;
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error("Proxy download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = alt;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(target, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div
        className={`relative group rounded overflow-hidden bg-muted border border-border flex-shrink-0 ${className}`}
      >
        {src && !thumbErrored ? (
          <>
            <SmartImage
              src={src}
              alt={alt}
              fill
              showSkeleton={false}
              priority={priority}
              loading={loading}
              onError={() => setThumbErrored(true)}
            />
            {/* View — top left */}
            <CustomButton
              variant="unstyled"
              size="unstyled"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewOpen(true);
              }}
              className="absolute top-0.5 left-0.5 p-px bg-black/55 hover:bg-black/80 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              title="View"
            >
              <Eye className="h-2 w-2 text-white" />
            </CustomButton>
            {/* Download — top right */}
            <CustomButton
              variant="unstyled"
              size="unstyled"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(e);
              }}
              className={cn(
                "absolute top-0.5 right-0.5 p-px bg-black/55 hover:bg-black/80 rounded transition-opacity duration-150",
                isDownloading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
              title="Download"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-2 w-2 text-white animate-spin" />
              ) : (
                <Download className="h-2 w-2 text-white" />
              )}
            </CustomButton>
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-primary/10 dark:bg-primary/20">
            <span className="text-xs font-semibold text-primary">
              {fallbackText?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
        )}
      </div>

      {/* View modal */}
      {viewOpen && (
        <CustomModal
          isOpen={viewOpen}
          onClose={() => setViewOpen(false)}
          size="lg"
          className="max-h-[92vh] gap-0 flex flex-col"
          disableScrollWrapper={true}
        >
          <DialogHeader className="p-4 border-b border-primary/30 m-0 mx-0 mt-0 bg-muted/30 flex-shrink-0">
            <div className="flex items-center justify-between gap-3 pr-8 text-left w-full">
              <div className="flex-1 min-w-0 text-left">
                <DialogTitle className="text-sm md:text-base font-semibold leading-tight text-foreground truncate">
                  {alt}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground leading-snug mt-0.5 truncate">
                  Image preview
                </DialogDescription>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <CustomButton
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      icon={<MoreHorizontal className="h-4 w-4" />}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload()} disabled={isDownloading}>
                      {isDownloading ? (
                        <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5 mr-2" />
                      )}
                      {isDownloading ? "Downloading..." : "Download"}
                    </DropdownMenuItem>
                    {effectivePreview && (
                      <DropdownMenuItem
                        onClick={() => window.open(effectivePreview, "_blank")}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-2" />
                        Open in new tab
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-muted/5 min-h-[280px]">
            {effectivePreview && !previewErrored ? (
              <div className="relative w-full max-w-full h-[60vh]">
                <SmartImage
                  src={effectivePreview}
                  alt={alt}
                  fill
                  objectFit="contain"
                  rounded="md"
                  onError={() => setPreviewErrored(true)}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageIcon className="h-12 w-12 opacity-30" />
                <p className="text-sm">No image available</p>
              </div>
            )}
          </div>
        </CustomModal>
      )}
    </>
  );
}
