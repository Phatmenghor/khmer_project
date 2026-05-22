"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "../shared/button/custom-button";
import { cn } from "@/lib/utils";

interface NavbarCartProps {
  cartItemCount: number;
  favoriteItemCount: number;
  favoriteAnimating: boolean;
  onFavoritesClick: () => void;
  onCartClick: () => void;
  isMobile?: boolean;
}

function NavbarCartComponent({
  cartItemCount,
  favoriteItemCount,
  favoriteAnimating,
  onFavoritesClick,
  onCartClick,
  isMobile = false,
}: NavbarCartProps) {
  const router = useRouter();

  const buttonClass = isMobile
    ? "relative h-10 w-10"
    : "relative h-10 w-10 hover:text-primary flex items-center justify-center";

  const iconClass = isMobile ? "h-7 w-7" : "h-7 w-7";

  return (
    <div className={cn("flex items-center", isMobile ? "gap-1" : "gap-2")}>
      <CustomButton
        variant="ghost"
        size="icon"
        className={buttonClass}
        onClick={onFavoritesClick}
      >
        <Heart className={iconClass} />
        {favoriteItemCount > 0 && (
          <Badge
            variant="destructive"
            className={cn(
              "absolute -top-1 -right-1 h-5 min-w-[20px] max-w-[28px] px-1 flex items-center justify-center text-[11px] font-semibold leading-none transition-transform duration-300",
              favoriteAnimating && "animate-slide-down"
            )}
          >
            {favoriteItemCount}
          </Badge>
        )}
      </CustomButton>

      <CustomButton
        variant="ghost"
        size="icon"
        className={buttonClass}
        onClick={onCartClick}
      >
        <ShoppingCart className={iconClass} />
        {cartItemCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 min-w-[20px] max-w-[28px] h-5 px-1 flex items-center justify-center text-xs font-semibold leading-none"
          >
            {cartItemCount > 99 ? "99+" : cartItemCount}
          </Badge>
        )}
      </CustomButton>
    </div>
  );
}

export const NavbarCart = memo(NavbarCartComponent);
