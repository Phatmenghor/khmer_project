"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CustomerAvatarProps {
  imageUrl?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "avatar" | "banner";
  bannerHeight?: "sm" | "md" | "lg" | "xl";
}

export const CustomAvatar: React.FC<CustomerAvatarProps> = ({
  imageUrl,
  name,
  size = "md",
  className = "",
  variant = "avatar",
  bannerHeight = "md",
}) => {
  // Avatar sizes (square)
  const avatarSizes = {
    sm: { avatar: "h-8 w-8", indicator: "w-2 h-2" },
    md: { avatar: "h-10 w-10", indicator: "w-3 h-3" },
    lg: { avatar: "h-12 w-12", indicator: "w-3.5 h-3.5" },
    xl: { avatar: "h-16 w-16", indicator: "w-4 h-4" },
  };

  // Banner sizes (rectangular - good for table display)
  const bannerSizes = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
    xl: "h-20",
  };

  const fallbackText = name?.charAt(0)?.toUpperCase() || "B";

  // Render banner variant
  if (variant === "banner") {
    return (
      <div className="inline-block w-full">
        <div
          className={`${
            bannerSizes[bannerHeight]
          } w-full max-w-xs rounded-lg overflow-hidden border-2 border-border bg-muted transition-all ${className}`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name || "Banner"}
              className="w-full h-full object-cover"
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
  }

  // Render avatar variant
  return (
    <div className="inline-block">
      <Avatar
        className={`${
          avatarSizes[size].avatar
        } border-2 border-background dark:border-card shadow-sm transition-all ${className}`}
      >
        <AvatarImage src={imageUrl || ""} alt={name || "User"} />
        <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary font-semibold">
          {fallbackText}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};
