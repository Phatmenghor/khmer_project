"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag } from "lucide-react";
import { SubcategoriesResponseModel } from "@/redux/features/master-data/store/models/response/subcategories-response";

interface SubcategoryCardProps {
  subcategory: SubcategoriesResponseModel;
  categoryId: string;
  className?: string;
}

/**
 * SubcategoryCard - Reusable subcategory card component for ecommerce
 * Features:
 * - Clean, modern design optimized for ecommerce
 * - Smooth hover animations
 * - Image loading states with skeleton
 * - Responsive sizing
 * - Product count badge
 * - Accessible with proper ARIA labels
 */
export function SubcategoryCard({ subcategory, categoryId, className }: SubcategoryCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link
      href={`/products?categoryId=${categoryId}&subcategoryId=${subcategory.id}`}
      className="group block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl"
      aria-label={`Browse products in ${subcategory.name} subcategory`}
    >
      <Card
        className={cn(
          "overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer h-full bg-card hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 hover-scale-102",
          className
        )}
      >
        <CardContent className="p-4 sm:p-5 flex flex-col items-center justify-center gap-2">
          {/* Icon/Image Container - Clean and centered */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300">
            {!imageError && subcategory.imageUrl ? (
              <>
                {!imageLoaded && (
                  <Skeleton className="absolute inset-0 w-full h-full rounded-xl" />
                )}
                <img
                  src={subcategory.imageUrl}
                  alt={subcategory.name}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  className={cn(
                    "w-full h-full object-cover rounded-xl transition-opacity duration-300",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                />
              </>
            ) : (
              <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/40" />
            )}
          </div>

          {/* Text Content */}
          <div className="text-center w-full">
            <h3 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300">
              {subcategory.name}
            </h3>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
