"use client";

import { memo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import { appImages } from "@/constants/app-resource/icons/app-images";

interface CategoryCardProps {
  category: CategoriesResponseModel;
  className?: string;
  loading?: "eager" | "lazy";
}


function CategoryCardComponent({ category, className, loading = "lazy" }: CategoryCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link
      href={`/products?categoryId=${category.id}`}
      className="group block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
      aria-label={`Browse ${category.activeProducts} products in ${category.name} category`}
    >
      <Card
        className={cn(
          "overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer h-full bg-card hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 hover-scale-102",
          className
        )}
      >
        <CardContent className="p-3 sm:p-3 flex flex-col items-center justify-center gap-2">
          {}
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center overflow-hidden rounded bg-muted/40 transition-all duration-300">
            {!imageLoaded && (
              <Skeleton className="absolute inset-0 w-full h-full rounded" />
            )}
            <Image
              src={imageError || !category.image?.sm ? appImages.noImage : category.image.sm}
              alt={category.name}
              fill
              loading={loading}
              className={cn(
                "object-cover transition-all duration-300 group-hover:scale-105",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </div>

          {}
          <div className="text-center w-full">
            <h3 className="font-semibold text-xs sm:text-xs line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-snug">
              {category.name}
            </h3>
          </div>

          {}
          {(category.activeProducts ?? 0) > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary/80 transition-colors">
              <ShoppingBag className="h-2 w-2" />
              <span className="font-medium">
                {category.activeProducts ?? 0} {(category.activeProducts ?? 0) === 1 ? 'item' : 'items'}
              </span>
              <ArrowRight className="h-2 w-2 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export const CategoryCard = memo(CategoryCardComponent);
