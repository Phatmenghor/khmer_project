"use client";

import React, { useState } from "react";
import { Eye, Download, X, MoreHorizontal, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CustomButton } from "@/components/shared/button/custom-button";
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
}

export function TableImage({
  src,
  previewSrc,
  alt = "Image",
  fallbackText,
  className = "h-9 w-9",
}: TableImageProps) {
  const [viewOpen, setViewOpen] = useState(false);
  const [thumbErrored, setThumbErrored] = useState(false);
  const [previewErrored, setPreviewErrored] = useState(false);
  const effectivePreview = previewSrc || src;

  const handleDownload = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const target = effectivePreview;
    if (!target) return;
    try {
      const res = await fetch(target);
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
    }
  };

  return (
    <>
      <div
        className={`relative group rounded overflow-hidden bg-muted border border-border flex-shrink-0 ${className}`}
      >
        {src && !thumbErrored ? (
          <>
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-cover"
              onError={() => setThumbErrored(true)}
            />
            {/* View — top left */}
            <CustomButton variant="unstyled" size="unstyled"
              type="button"
              onClick={(e) => { e.stopPropagation(); setViewOpen(true); }}
              className="absolute top-0.5 left-0.5 p-0.5 bg-black/55 hover:bg-black/80 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              title="View"
            >
              <Eye className="h-2.5 w-2.5 text-white" />
            </CustomButton>
            {/* Download — top right */}
            <CustomButton variant="unstyled" size="unstyled"
              type="button"
              onClick={(e) => { e.stopPropagation(); handleDownload(e); }}
              className="absolute top-0.5 right-0.5 p-0.5 bg-black/55 hover:bg-black/80 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              title="Download"
            >
              <Download className="h-2.5 w-2.5 text-white" />
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
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <DialogContent
          className="w-full sm:max-w-lg p-0 gap-0 flex flex-col overflow-hidden"
          closeButtonClassName="hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{alt}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Image preview</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <CustomButton variant="ghost" size="sm" className="h-7 w-7 p-0" icon={<MoreHorizontal className="h-4 w-4" />} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDownload()}>
                    <Download className="h-3.5 w-3.5 mr-2" />
                    Download
                  </DropdownMenuItem>
                  {effectivePreview && (
                    <DropdownMenuItem onClick={() => window.open(effectivePreview, "_blank")}>
                      <ExternalLink className="h-3.5 w-3.5 mr-2" />
                      Open in new tab
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <CustomButton
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setViewOpen(false)}
                icon={<X className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Body */}
          <div className="flex items-center justify-center bg-muted/20 min-h-[240px] p-4">
            {effectivePreview && !previewErrored ? (
              <img
                src={effectivePreview}
                alt={alt}
                className="max-w-full max-h-[60vh] object-contain rounded"
                onError={() => setPreviewErrored(true)}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageIcon className="h-12 w-12 opacity-30" />
                <p className="text-sm">No image available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
