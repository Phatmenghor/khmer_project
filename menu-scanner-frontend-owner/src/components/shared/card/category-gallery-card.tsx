"use client";

import { memo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/shared/image/smart-image";
import { LayoutGrid } from "lucide-react";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import { appImages } from "@/constants/app-resource/icons/app-images";

interface CategoryGalleryCardProps {
  category: CategoriesResponseModel;
  className?: string;
  loading?: "eager" | "lazy";
}

function CategoryGalleryCardComponent({
  category,
  className,
  loading = "lazy",
}: CategoryGalleryCardProps) {
  const imageUrl = category.image?.md || category.image?.sm || category.image?.o || "";
  const itemCount = category.activeProducts ?? category.totalProducts ?? category.productCount ?? 0;
  const description = category.description?.trim();

  return (
    <Link
      href={`/products?categoryId=${category.id}`}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-[18px] border border-border/80 bg-card p-2.5 sm:p-3 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] h-full",
        className
      )}
      aria-label={`Browse ${category.name} category`}
    >
      <div>
        {/* Top 1x1 Image Frame */}
        <div className="relative aspect-square w-full overflow-hidden rounded-[14px] bg-gradient-to-tr from-primary/10 via-muted/30 to-muted/10 border border-border/50 shrink-0">
          <SmartImage
            src={imageUrl}
            alt={category.name}
            fill
            fallbackSrc={appImages.noImage}
            loading={loading}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-2.5 group-hover:scale-105 transition-transform duration-300 ease-out"
          />



          {/* Animated Slide-Up Description Overlay */}
          <div className="absolute inset-0 z-10 p-3 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/80 to-black/40 backdrop-blur-xs text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out pointer-events-none">
            <p className="text-[11px] sm:text-xs text-white/95 leading-relaxed font-medium overflow-y-auto max-h-full line-clamp-4 pr-0.5">
              {description || `Browse active menu items in ${category.name}`}
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="pt-2.5 pb-1">
          <div className="flex items-center justify-between gap-1.5">
            <h3 className="font-extrabold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate">
              {category.name}
            </h3>
            {itemCount > 0 && (
              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export const CategoryGalleryCard = memo(CategoryGalleryCardComponent);
