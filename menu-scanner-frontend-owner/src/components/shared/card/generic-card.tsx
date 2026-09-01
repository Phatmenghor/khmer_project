"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { SmartImage } from "@/components/shared/image/smart-image";
import { ArrowRight, ShoppingBag } from "lucide-react";

export interface GenericCardProps {
  id: string | number;
  name: string;
  imageUrl?: string;
  count?: number;
  countLabel?: string;
  href: string;
  ariaLabel: string;
  className?: string;
  countSingular?: string;
  countPlural?: string;
  loading?: "eager" | "lazy";
}

/**
 * Reusable card component for displaying items (brands, categories, etc.)
 * Replaces: brand-card.tsx and category-card.tsx (90% code duplication)
 *
 * Usage:
 * <GenericCard
 *   id="brand-1"
 *   name="Nike"
 *   imageUrl="/nike.png"
 *   count={150}
 *   href="/products?brandId=brand-1"
 *   ariaLabel="Browse 150 products from Nike"
 * />
 */
function GenericCardComponent({
  id,
  name,
  imageUrl,
  count = 0,
  countLabel,
  href,
  ariaLabel,
  className,
  countSingular = "item",
  countPlural = "items",
  loading = "lazy",
}: GenericCardProps) {
  const [imageError, setImageError] = useState(false);

  const displayCount = countLabel || `${count} ${count === 1 ? countSingular : countPlural}`;
  const showCount = count > 0;

  return (
    <Link
      href={href}
      className="group block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
      aria-label={ariaLabel}
    >
      <Card
        className={cn(
          "overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer h-full bg-card hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 hover:scale-102",
          className
        )}
      >
        <CardContent className="p-3 sm:p-3 flex flex-col items-center justify-center gap-2">
          {/* Image Container */}
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center overflow-hidden rounded bg-gradient-to-br from-primary/5 to-primary/10 group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300">
            {!imageError && imageUrl ? (
              <SmartImage
                src={imageUrl}
                alt={name}
                fill
                rounded="md"
                loading={loading}
                className="group-hover:scale-105"
                showSkeleton={!imageError}
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-xs font-bold text-primary/80 group-hover:text-primary transition-colors">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Name */}
          <div className="text-center w-full">
            <h3 className="font-semibold text-xs sm:text-xs line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-snug">
              {name}
            </h3>
          </div>

          {/* Count Badge */}
          {showCount && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary/80 transition-colors">
              <ShoppingBag className="h-2 w-2" />
              <span className="font-medium">{displayCount}</span>
              <ArrowRight className="h-2 w-2 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export const GenericCard = memo(GenericCardComponent);
