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
            <SmartImage
              src={category.image?.sm}
              alt={category.name}
              fill
              rounded="md"
              loading={loading}
              className="group-hover:scale-105"
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
