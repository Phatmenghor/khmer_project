"use client";

import { memo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/shared/image/smart-image";
import { Award } from "lucide-react";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import { appImages } from "@/constants/app-resource/icons/app-images";

interface BrandGalleryCardProps {
  brand: BrandResponseModel;
  className?: string;
  loading?: "eager" | "lazy";
}

function BrandGalleryCardComponent({
  brand,
  className,
  loading = "lazy",
}: BrandGalleryCardProps) {
  const imageUrl = brand.image?.md || brand.image?.sm || brand.image?.o || "";
  const itemCount = brand.activeProducts ?? 0;
  const description = brand.description?.trim();

  return (
    <Link
      href={`/products?brandId=${brand.id}`}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-[18px] border border-border/80 bg-card p-2.5 sm:p-3 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] h-full",
        className
      )}
      aria-label={`Browse ${brand.name} brand`}
    >
      <div>
        {/* Top 1x1 Image Frame */}
        <div className="relative aspect-square w-full overflow-hidden rounded-[14px] bg-gradient-to-tr from-primary/10 via-muted/30 to-muted/10 border border-border/50 shrink-0">
          <SmartImage
            src={imageUrl}
            alt={brand.name}
            fill
            fallbackSrc={appImages.noImage}
            loading={loading}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-2.5 group-hover:scale-105 transition-transform duration-300 ease-out"
          />

          {/* Top Left Stack Icon Badge */}
          <div className="absolute top-2 left-2 z-20">
            <span className="flex items-center justify-center p-1.5 rounded-full bg-primary text-primary-foreground shadow-xs">
              <Award className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Animated Slide-Up Description Overlay */}
          <div className="absolute inset-0 z-10 p-3 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/80 to-black/40 backdrop-blur-xs text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out pointer-events-none">
            <p className="text-[11px] sm:text-xs text-white/95 leading-relaxed font-medium overflow-y-auto max-h-full line-clamp-4 pr-0.5">
              {description || `Browse authentic items from ${brand.name}`}
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="pt-2.5 pb-1">
          <div className="flex items-center justify-between gap-1.5">
            <h3 className="font-extrabold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate">
              {brand.name}
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

export const BrandGalleryCard = memo(BrandGalleryCardComponent);
