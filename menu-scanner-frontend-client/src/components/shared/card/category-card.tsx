"use client";

import { memo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { SmartImage } from "@/components/shared/image/smart-image";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";

interface CategoryCardProps {
  category: CategoriesResponseModel;
  className?: string;
  loading?: "eager" | "lazy";
}


function CategoryCardComponent({ category, className, loading = "lazy" }: CategoryCardProps) {
  const itemCount = category.activeProducts ?? 0;

  return (
    <Link
      href={`/products?categoryId=${category.id}`}
      className="group block focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 rounded-[20px] transition-all"
      aria-label={`Browse ${itemCount} products in ${category.name} category`}
    >
      <Card
        className={cn(
          "relative overflow-hidden rounded-[20px] border-0 bg-card/90 backdrop-blur-xs shadow-2xs p-3 sm:p-4 text-center transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-between gap-3 hover:shadow-md hover:shadow-primary/5 hover:bg-card hover:-translate-y-1 active:scale-[0.97]",
          className
        )}
      >
        {/* Ambient background glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Image Container */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-muted/60 to-muted/20 border border-border/60 shadow-2xs group-hover:border-primary/30 group-hover:shadow-sm transition-all duration-300 shrink-0">
          <SmartImage
            src={category.image?.sm}
            alt={category.name}
            fill
            rounded="xl"
            loading={loading}
            className="object-cover group-hover:scale-110 transition-transform duration-300 ease-out"
          />
        </div>

        {/* Category Name & Item Count */}
        <div className="flex flex-col items-center justify-center gap-1.5 w-full z-10">
          <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-snug">
            {category.name}
          </h3>

          {itemCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/60 group-hover:bg-primary/10 group-hover:text-primary px-2.5 py-0.5 rounded-full border border-border/40 group-hover:border-primary/20 transition-all duration-200">
              <ShoppingBag className="h-3 w-3 shrink-0" />
              <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
              <ArrowRight className="h-2.5 w-2.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}

export const CategoryCard = memo(CategoryCardComponent);
