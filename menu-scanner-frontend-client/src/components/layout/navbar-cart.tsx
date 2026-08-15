"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "../shared/button/custom-button";
import { cn } from "@/lib/utils";

interface NavbarCartProps {
  cartItemCount: number;
  favoriteItemCount: number;
  favoriteAnimating: boolean;
  cartAnimating: boolean;
  onFavoritesClick: () => void;
  onCartClick: () => void;
  onOrdersClick?: () => void;
  showOrdersIcon?: boolean;
  isMobile?: boolean;
}

function NavbarCartComponent({
  cartItemCount,
  favoriteItemCount,
  favoriteAnimating,
  cartAnimating,
  onFavoritesClick,
  onCartClick,
  onOrdersClick,
  showOrdersIcon = false,
  isMobile = false,
}: NavbarCartProps) {
  const router = useRouter();

  const buttonClass = isMobile
    ? "relative h-7 w-7"
    : "relative h-7 w-7 hover:text-primary flex items-center justify-center";

  const iconClass = isMobile ? "h-5 w-5" : "h-5 w-5";

  return (
    <div className={cn("flex items-center", isMobile ? "gap-1" : "gap-1")}>
      <CustomButton
        variant="ghost"
        size="icon"
        className={buttonClass}
        onClick={onFavoritesClick}
        title="Favorites"
      >
        <Heart className={iconClass} />
        {favoriteItemCount > 0 && (
          <Badge
            variant="destructive"
            className={cn(
              "absolute -top-1 -right-1 h-3 min-w-[20px] max-w-[28px] px-1 flex items-center justify-center text-[11px] font-semibold leading-none transition-transform duration-300",
              favoriteAnimating && "animate-slide-down"
            )}
          >
            {favoriteItemCount}
          </Badge>
        )}
      </CustomButton>

      {showOrdersIcon && (
        <CustomButton
          variant="ghost"
          size="icon"
          className={buttonClass}
          onClick={onOrdersClick}
          title="My Orders"
        >
          <ShoppingBag className={iconClass} />
        </CustomButton>
      )}

      <CustomButton
        variant="ghost"
        size="icon"
        className={buttonClass}
        onClick={onCartClick}
        title="Cart"
      >
        <ShoppingCart className={iconClass} />
        {cartItemCount > 0 && (
          <Badge
            variant="destructive"
            className={cn(
              "absolute -top-1 -right-1 h-3 min-w-[20px] max-w-[28px] px-1 flex items-center justify-center text-[11px] font-semibold leading-none transition-transform duration-300",
              cartAnimating && "animate-slide-down"
            )}
          >
            {cartItemCount > 99 ? "99+" : cartItemCount}
          </Badge>
        )}
      </CustomButton>
    </div>
  );
}

export const NavbarCart = memo(NavbarCartComponent);
