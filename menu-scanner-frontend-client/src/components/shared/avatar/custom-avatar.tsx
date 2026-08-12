"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SmartImage } from "@/components/shared/image/smart-image";

interface CustomerAvatarProps {
  imageUrl?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  className?: string;
  variant?: "avatar" | "banner";
  bannerHeight?: "sm" | "md" | "lg" | "xl";
  enableImagePreview?: boolean;
}

export const CustomAvatar: React.FC<CustomerAvatarProps> = ({
  imageUrl,
  name,
  size = "md",
  className = "",
  variant = "avatar",
  bannerHeight = "md",
  enableImagePreview = false,
}) => {
  const [showPreview, setShowPreview] = useState(false);
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
            <SmartImage
              src={imageUrl}
              alt={name || "Banner"}
              fill
              className="hover:scale-105"
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
            <DialogTitle className="sr-only">{name || "Image Preview"}</DialogTitle>
            <div className="relative bg-white dark:bg-gray-900 p-4 rounded shadow-2xl border border-border">
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-[80vw] h-[70vh] max-w-2xl">
                  <SmartImage
                    src={imageUrl}
                    alt={name || "Banner"}
                    fill
                    objectFit="contain"
                    rounded="md"
                  />
                </div>
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
        } border-2 border-background dark:border-card shadow-2xs group-hover:border-primary/40 transition-all ${
          imageUrl && enableImagePreview ? "cursor-pointer hover:scale-105" : ""
        } ${className}`}
      >
        {imageUrl ? (
          <AvatarImage src={imageUrl} alt={name || "User"} className="object-cover" />
        ) : null}
        <AvatarFallback className="bg-gradient-to-br from-primary/20 via-primary/15 to-primary/5 text-primary border border-primary/25 font-extrabold shadow-2xs select-none">
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
          <DialogTitle className="sr-only">{name || "Image Preview"}</DialogTitle>
          <div className="relative bg-white dark:bg-gray-900 p-4 rounded shadow-2xl border border-border">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-[70vw] h-[70vh] max-w-2xl">
                <SmartImage
                  src={imageUrl}
                  alt={name || "User"}
                  fill
                  objectFit="contain"
                  rounded="md"
                />
              </div>
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
