"use client";

import React, { useState } from "react";
import { Eye, Download, X, MoreHorizontal, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TableImageProps {
  src?: string;
  alt?: string;
  fallbackText?: string;
  className?: string;
}

export function TableImage({
  src,
  alt = "Image",
  fallbackText,
  className = "h-10 w-10 rounded-[10px]",
}: TableImageProps) {
  const [viewOpen, setViewOpen] = useState(false);
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

  const isWide = (imgDimensions?.ratio ?? 1) > 1.4;

  const handleDownload = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!src) return;
    try {
      const res = await fetch(src);
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
      window.open(src, "_blank");
    }
  };

  return (
    <>
      <div
        className={`relative group rounded-[10px] overflow-hidden bg-muted border border-border flex-shrink-0 ${className}`}
      >
        {src ? (
          <>
            <img src={src} alt={alt} className="w-full h-full object-cover" />
            {/* Dynamic hover overlay actions — starting from top */}
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none flex items-start justify-between p-0.5">
              {/* View — top left */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewOpen(true); }}
                className="pointer-events-auto p-0.5 bg-black/60 hover:bg-black/85 backdrop-blur-[2px] rounded-[4px] text-white shadow-2xs transition-transform hover:scale-105"
                title="View"
              >
                <Eye className="h-2.5 w-2.5" />
              </button>
              {/* Download — top right */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDownload(e); }}
                className="pointer-events-auto p-0.5 bg-black/60 hover:bg-black/85 backdrop-blur-[2px] rounded-[4px] text-white shadow-2xs transition-transform hover:scale-105"
                title="Download"
              >
                <Download className="h-2.5 w-2.5" />
              </button>
            </div>
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-primary/10 dark:bg-primary/20">
            <span className="text-xs font-semibold text-primary">
              {fallbackText?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
        )}
      </div>

      {/* Dynamic View modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <DialogContent
          className={cn(
            "w-full p-0 gap-0 flex flex-col overflow-hidden transition-all duration-300",
            isWide ? "sm:max-w-4xl" : "sm:max-w-lg"
          )}
          closeButtonClassName="right-3 top-3 text-white/80 hover:text-white"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b bg-muted/40 flex-shrink-0 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm sm:text-base font-semibold text-foreground truncate">{alt}</p>
                {imgDimensions && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                    {imgDimensions.width} × {imgDimensions.height} px
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">High Resolution Image Preview</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 pr-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload()}
                className="h-8 px-2.5 text-xs gap-1.5 rounded-[10px]"
                title="Download Image"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              {src && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(src, "_blank")}
                  className="h-8 w-8 p-0 rounded-[10px]"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="relative flex-1 overflow-hidden p-4 flex items-center justify-center bg-black/90 dark:bg-black/95 min-h-[300px]">
            {src ? (
              <>
                {/* Ambient Blurred Background Layer */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-25 blur-2xl scale-110 pointer-events-none"
                  style={{ backgroundImage: `url(${src})` }}
                />

                {/* Main Dynamic Image Container */}
                <div className={cn(
                  "relative z-10 flex items-center justify-center w-full h-full overflow-hidden p-1",
                  isWide ? "max-h-[72vh]" : "max-h-[520px] max-w-[520px] aspect-square"
                )}>
                  <img
                    src={src}
                    alt={alt}
                    onLoad={handleImageLoad}
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
        </DialogContent>
      </Dialog>
    </>
  );
}
