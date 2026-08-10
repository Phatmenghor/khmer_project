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

import { appImages } from "@/constants/app-resource/icons/app-images";

interface TableImageProps {
  src?: string;
  previewSrc?: string;
  alt?: string;
  fallbackText?: string;
  className?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  aspectRatio?: "1x1" | "square" | "auto" | "banner";
}

export function TableImage({
  src,
  previewSrc,
  alt = "Image",
  fallbackText,
  className = "h-10 w-10 rounded-[10px]",
  priority,
  loading,
  aspectRatio = "1x1",
}: TableImageProps) {
  const [viewOpen, setViewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
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

  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number; ratio: number } | null>(null);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      setImgDimensions({
        width: naturalWidth,
        height: naturalHeight,
        ratio: naturalWidth / naturalHeight,
      });
    }
  };

  const isForce1x1 = aspectRatio === "1x1" || aspectRatio === "square";
  const isWide = !isForce1x1 && aspectRatio === "banner" && (imgDimensions?.ratio ?? 1) > 1.4;

  return (
    <>
      <div
        className={`relative group rounded-[10px] overflow-hidden bg-muted border border-border flex-shrink-0 ${className}`}
      >
        <SmartImage
          src={src}
          alt={alt}
          fill
          fallbackSrc={appImages.noImage}
          showSkeleton={false}
          priority={priority}
          loading={loading}
        />
        {/* Dynamic hover overlay actions — starting from top */}
        {src && (
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none flex items-start justify-between p-0.5">
            {/* View — top left */}
            <CustomButton
              variant="unstyled"
              size="unstyled"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewOpen(true);
              }}
              className="pointer-events-auto p-0.5 bg-black/60 hover:bg-black/85 backdrop-blur-[2px] rounded-[4px] text-white shadow-2xs transition-transform hover:scale-105"
              title="View"
            >
              <Eye className="h-2.5 w-2.5" />
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
                "pointer-events-auto p-0.5 bg-black/60 hover:bg-black/85 backdrop-blur-[2px] rounded-[4px] text-white shadow-2xs transition-transform hover:scale-105",
                isDownloading && "opacity-100"
              )}
              title="Download"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
              ) : (
                <Download className="h-2.5 w-2.5" />
              )}
            </CustomButton>
          </div>
        )}
      </div>

      {/* Dynamic View modal */}
      {viewOpen && (
        <CustomModal
          isOpen={viewOpen}
          onClose={() => setViewOpen(false)}
          size={isWide ? "xl" : "md"}
          className={cn(
            "max-h-[92vh] p-0 gap-0 flex flex-col overflow-hidden transition-all duration-300",
            isWide ? "sm:max-w-4xl" : "sm:max-w-lg"
          )}
          disableScrollWrapper={true}
        >
          <DialogHeader className="p-3.5 sm:p-4 border-b border-border/80 m-0 mx-0 mt-0 bg-muted/40 flex-shrink-0">
            <div className="flex items-center justify-between gap-3 pr-8 text-left w-full">
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-sm sm:text-base font-semibold leading-tight text-foreground truncate">
                    {alt}
                  </DialogTitle>
                  {imgDimensions && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                      {imgDimensions.width} × {imgDimensions.height} px
                    </span>
                  )}
                </div>
                <DialogDescription className="text-xs text-muted-foreground leading-snug mt-0.5 truncate">
                  High Resolution Image Preview
                </DialogDescription>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload()}
                  disabled={isDownloading}
                  className="h-8 px-2.5 text-xs gap-1.5 rounded-[10px]"
                  title="Download Image"
                >
                  {isDownloading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">Download</span>
                </CustomButton>

                {effectivePreview && (
                  <CustomButton
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(effectivePreview, "_blank")}
                    className="h-8 w-8 p-0 rounded-[10px]"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </CustomButton>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Dynamic Image Body with Ambient Blur */}
          <div className="relative flex-1 overflow-hidden p-4 flex items-center justify-center bg-black/90 dark:bg-black/95 min-h-[300px]">
            {effectivePreview && !previewErrored ? (
              <>
                {/* Ambient Blurred Background Layer */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-25 blur-2xl scale-110 pointer-events-none"
                  style={{ backgroundImage: `url(${effectivePreview})` }}
                />

                {/* Main Dynamic Image Container */}
                <div className={cn(
                  "relative z-10 flex items-center justify-center w-full h-full overflow-hidden p-1",
                  isWide ? "max-h-[72vh]" : "max-h-[520px] max-w-[520px] aspect-square"
                )}>
                  <img
                    src={effectivePreview}
                    alt={alt}
                    onLoad={handleImageLoad}
                    onError={() => setPreviewErrored(true)}
                    className={cn(
                      "rounded-xl shadow-2xl transition-all duration-300 object-contain",
                      isWide
                        ? "max-h-[72vh] w-full max-w-full"
                        : "w-full h-full aspect-square bg-black/40 border border-white/10 p-2"
                    )}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground z-10 py-12">
                <ImageIcon className="h-12 w-12 opacity-30 text-white" />
                <p className="text-sm text-white/70">No image available</p>
              </div>
            )}
          </div>
        </CustomModal>
      )}
    </>
  );
}
