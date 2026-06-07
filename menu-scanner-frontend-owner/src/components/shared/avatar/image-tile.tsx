"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageTileProps {
  /** Image URL — when missing the icon fallback is rendered. */
  imageUrl?: string;
  /** Alt text + caption for the zoom preview. */
  name?: string;
  /** Fallback icon shown when no image is provided. */
  icon?: LucideIcon;
  /** Container size — default `w-12 h-12`. */
  sizeClass?: string;
  className?: string;
  /** When true (default), clicking the tile opens a click-to-zoom preview. */
  enablePreview?: boolean;
}

/**
 * Square image tile used in modal headers (12×12 by default). Matches the
 * client modal header pattern — rounded muted tile, image when present,
 * icon fallback otherwise — and additionally supports click-to-zoom
 * preview via the same Dialog-based pattern as CustomAvatar.
 */
export function ImageTile({
  imageUrl,
  name,
  icon: Icon,
  sizeClass = "w-12 h-12",
  className,
  enablePreview = true,
}: ImageTileProps) {
  const [open, setOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const tile = (
    <div
      className={cn(
        "flex-shrink-0 rounded overflow-hidden bg-muted border border-border/50 flex items-center justify-center",
        sizeClass,
        imageUrl && enablePreview && "cursor-pointer hover:border-primary/50 transition-colors",
        className,
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name || "Image"}
          className="w-full h-full object-cover"
        />
      ) : Icon ? (
        <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
      ) : null}
    </div>
  );

  if (!imageUrl || !enablePreview) {
    return tile;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{tile}</DialogTrigger>
      <DialogContent
        className="max-w-fit border-none bg-transparent shadow-none p-0"
      >
        <DialogTitle className="sr-only">{name || "Image Preview"}</DialogTitle>
        <div className="relative bg-white dark:bg-gray-900 p-4 rounded shadow-2xl border border-border">
          <div className="flex flex-col items-center gap-3">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded z-10">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs text-muted-foreground">
                    Loading image...
                  </p>
                </div>
              </div>
            )}
            <img
              src={imageUrl}
              alt={name || "Image"}
              className="max-w-[70vw] max-h-[70vh] w-auto h-auto object-contain rounded"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
              style={{
                opacity: imageLoading ? 0 : 1,
                transition: "opacity 0.3s",
              }}
            />
            {name && (
              <p className="text-xs font-semibold text-center text-gray-900 dark:text-white">
                {name}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
