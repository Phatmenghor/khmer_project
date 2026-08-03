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
      className="group block focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 rounded-[20px] transition-all h-full"
      aria-label={`Browse ${itemCount} products in ${category.name} category`}
    >
      <Card
        className={cn(
          "relative overflow-hidden rounded-[20px] border border-border/60 bg-card p-3.5 sm:p-4 text-center transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-between gap-3 hover:shadow-md hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1 active:scale-[0.97]",
          className
        )}
      >
        {/* Subtle background ambient glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Hero Photo Container */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-tr from-primary/10 via-muted/50 to-muted/20 border border-border/60 shadow-2xs group-hover:border-primary/40 group-hover:shadow-md group-hover:ring-2 group-hover:ring-primary/20 transition-all duration-300 shrink-0">
          <SmartImage
            src={category.image?.sm}
            alt={category.name}
            fill
            rounded="xl"
            loading={loading}
            className="object-cover group-hover:scale-110 transition-transform duration-300 ease-out"
          />
        </div>

        {/* Category Name */}
        <div className="flex flex-col items-center justify-center w-full z-10">
          <h3
            title={category.name}
            className="font-bold text-xs sm:text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-snug tracking-tight text-center"
          >
            {category.name}
          </h3>
        </div>
      </Card>
    </Link>
  );
}

export const CategoryCard = memo(CategoryCardComponent);
