"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";

interface BrandCardProps {
  brand: BrandResponseModel;
  className?: string;
}

export function BrandCard({ brand, className }: BrandCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link
      href={`/products?brandId=${brand.id}`}
      className="group block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl"
      aria-label={`Browse ${brand.activeProducts} products from ${brand.name}`}
    >
      <Card
        className={cn(
          "overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer h-full bg-card hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 hover-scale-102",
          className
        )}
      >
        <CardContent className="p-4 sm:p-5 flex flex-col items-center justify-center gap-3">
          {/* Logo Container */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300">
            {!imageError && brand.imageUrl ? (
              <>
                {!imageLoaded && (
                  <Skeleton className="absolute inset-0 w-full h-full rounded-xl" />
                )}
                <Image
                  src={brand.imageUrl}
                  alt={brand.name}
                  width={80}
                  height={80}
                  className={cn(
                    "w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              </>
            ) : (
              <span className="text-3xl sm:text-4xl font-bold text-primary/80 group-hover:text-primary transition-colors">
                {brand.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Brand Name - always visible */}
          <div className="text-center w-full">
            <h3 className="font-semibold text-sm sm:text-base line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-snug">
              {brand.name}
            </h3>
          </div>

          {/* Product Count - always visible */}
          {brand.activeProducts > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-primary/80 transition-colors">
              <ShoppingBag className="h-3 w-3" />
              <span className="font-medium">
                {brand.activeProducts} {brand.activeProducts === 1 ? "item" : "items"}
              </span>
              <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
