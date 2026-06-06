"use client";

import React, { useState } from "react";
import { Eye, Download, X, MoreHorizontal, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  className = "h-9 w-9",
}: TableImageProps) {
  const [viewOpen, setViewOpen] = useState(false);

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
        className={`relative group rounded overflow-hidden bg-muted border border-border flex-shrink-0 ${className}`}
      >
        {src ? (
          <>
            <img src={src} alt={alt} className="w-full h-full object-cover" />
            {/* View — top left */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setViewOpen(true); }}
              className="absolute top-0.5 left-0.5 p-0.5 bg-black/55 hover:bg-black/80 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              title="View"
            >
              <Eye className="h-2.5 w-2.5 text-white" />
            </button>
            {/* Download — top right */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleDownload(e); }}
              className="absolute top-0.5 right-0.5 p-0.5 bg-black/55 hover:bg-black/80 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              title="Download"
            >
              <Download className="h-2.5 w-2.5 text-white" />
            </button>
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
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDownload()}>
                    <Download className="h-3.5 w-3.5 mr-2" />
                    Download
                  </DropdownMenuItem>
                  {src && (
                    <DropdownMenuItem onClick={() => window.open(src, "_blank")}>
                      <ExternalLink className="h-3.5 w-3.5 mr-2" />
                      Open in new tab
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setViewOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="flex items-center justify-center bg-muted/20 min-h-[240px] p-4">
            {src ? (
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[60vh] object-contain rounded"
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
