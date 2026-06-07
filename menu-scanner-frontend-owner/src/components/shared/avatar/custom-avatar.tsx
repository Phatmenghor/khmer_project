"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CustomAvatarProps {
  imageUrl?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  className?: string;
  variant?: "avatar" | "banner";
  bannerHeight?: "sm" | "md" | "lg" | "xl";
  enableImagePreview?: boolean;
}

/**
 * Image/avatar component with optional click-to-preview behavior.
 * Lifted from the client project so the owner project gets the same
 * banner variant, xxl size, and hover-preview UX. See the
 * `enableImagePreview` prop to opt-in to the click-to-zoom modal.
 */
export const CustomAvatar: React.FC<CustomAvatarProps> = ({
  imageUrl,
  name,
  size = "md",
  className = "",
  variant = "avatar",
  bannerHeight = "md",
  enableImagePreview = false,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const justOpenedRef = useRef(false);

  const avatarSizes = {
    sm: { avatar: "h-5 w-5", indicator: "w-1 h-1" },
    md: { avatar: "h-7 w-7", indicator: "w-2 h-2" },
    lg: { avatar: "h-8 w-8", indicator: "w-2.5 h-2.5" },
    xl: { avatar: "h-11 w-11", indicator: "w-3 h-3" },
    xxl: { avatar: "h-14 w-14", indicator: "w-3 h-3" },
  };

  const bannerSizes = {
    sm: "h-5",
    md: "h-8",
    lg: "h-11",
    xl: "h-14",
  };

  const fallbackText = name?.charAt(0)?.toUpperCase() || "B";

  const handleMouseEnter = () => {
    if (!imageUrl || !enableImagePreview) return;

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }

    openTimeoutRef.current = setTimeout(() => {
      setShowPreview(true);
      setImageLoading(true);
      justOpenedRef.current = true;

      setTimeout(() => {
        justOpenedRef.current = false;
      }, 500);
    }, 600);
  };

  const handleMouseLeave = () => {
    if (justOpenedRef.current || !enableImagePreview) return;

    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }

    closeTimeoutRef.current = setTimeout(() => {
      setShowPreview(false);
    }, 4000);
  };

  const handlePreviewMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  };

  if (variant === "banner") {
    const content = (
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block w-full"
      >
        <div
          className={`${
            bannerSizes[bannerHeight]
          } w-full max-w-xs rounded overflow-hidden border-2 border-border bg-muted ${
            imageUrl && enableImagePreview
              ? "cursor-pointer hover:border-primary/50"
              : ""
          } transition-all ${className}`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name || "Banner"}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 dark:bg-primary/20">
              <span className="text-xs text-muted-foreground font-medium">
                {name || "No image"}
              </span>
            </div>
          )}
        </div>
      </div>
    );

    if (!enableImagePreview) {
      return content;
    }

    return (
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogTrigger asChild>{content}</DialogTrigger>

        {imageUrl && (
          <DialogContent
            className="max-w-fit border-none bg-transparent shadow-none p-0"
            onMouseEnter={handlePreviewMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <DialogTitle className="sr-only">
              {name || "Image Preview"}
            </DialogTitle>
            <div className="relative bg-white dark:bg-gray-900 p-4 rounded shadow-2xl border border-border">
              <div className="flex flex-col items-center gap-3">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded z-10">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      <p className="text-xs text-muted-foreground">
                        Loading image...
                      </p>
                    </div>
                  </div>
                )}

                <img
                  src={imageUrl}
                  alt={name || "Banner"}
                  className="max-w-[80vw] max-h-[70vh] w-auto h-auto object-contain rounded"
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
        )}
      </Dialog>
    );
  }

  const avatarContent = (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      <Avatar
        className={`${
          avatarSizes[size].avatar
        } border-2 border-background dark:border-card shadow-sm group-hover:border-primary/30 transition-all ${
          imageUrl && enableImagePreview ? "cursor-pointer hover:scale-110" : ""
        } ${className}`}
      >
        {imageUrl && <AvatarImage src={imageUrl} alt={name || "User"} />}
        <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary font-semibold">
          {fallbackText}
        </AvatarFallback>
      </Avatar>
    </div>
  );

  if (!enableImagePreview) {
    return avatarContent;
  }

  return (
    <Dialog open={showPreview} onOpenChange={setShowPreview}>
      <DialogTrigger asChild>{avatarContent}</DialogTrigger>

      {imageUrl && (
        <DialogContent
          className="max-w-fit border-none bg-transparent shadow-none p-0"
          onMouseEnter={handlePreviewMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <DialogTitle className="sr-only">
            {name || "Image Preview"}
          </DialogTitle>
          <div className="relative bg-white dark:bg-gray-900 p-4 rounded shadow-2xl border border-border">
            <div className="flex flex-col items-center gap-3">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded z-10">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-xs text-muted-foreground">
                      Loading image...
                    </p>
                  </div>
                </div>
              )}

              <img
                src={imageUrl}
                alt={name || "User"}
                className="max-w-[70vw] max-h-[70vh] w-auto h-auto object-contain rounded"
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
                style={{
                  opacity: imageLoading ? 0 : 1,
                  transition: "opacity 0.3s",
                }}
              />
              <p className="text-xs font-semibold text-center text-gray-900 dark:text-white">
                {name || "User"}
              </p>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};
