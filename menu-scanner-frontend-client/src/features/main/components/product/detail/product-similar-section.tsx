"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/shared/card/product-card";
import { CustomButton } from "@/components/shared/button/custom-button";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";

interface ProductSimilarSectionProps {
  similarProducts: ProductDetailResponseModel[];
  similarLoading: boolean;
  similarHasMore: boolean;
  onLoadMore: () => void;
  onProductClick: (productId: string) => void;
}

export function ProductSimilarSection({
  similarProducts,
  similarLoading,
  similarHasMore,
  onLoadMore,
  onProductClick,
}: ProductSimilarSectionProps) {
  if (similarProducts.length === 0 && !similarLoading) {
    return null;
  }

  return (
    <div className="pt-5 sm:pt-6 border-t border-border/60 mt-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            You Might Also Like
          </h2>
        </div>
      </div>

      {/* Grid Layout - Compact columns matching Products & Home Page */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5 lg:gap-4">
        {similarProducts.map((p) => (
          <div
            key={p.id}
            onClick={() => onProductClick(p.id)}
            className="cursor-pointer transition-transform hover:-translate-y-1"
          >
            <ProductCard product={p as any} />
          </div>
        ))}
      </div>

      {/* Load More Action Button */}
      {similarHasMore && (
        <div className="mt-5 flex justify-center">
          <CustomButton
            variant="outline"
            size="default"
            onClick={onLoadMore}
            disabled={similarLoading}
            className="rounded-full px-5 py-1.5 border-border/70 font-semibold text-xs hover:border-primary hover:text-primary transition-all cursor-pointer shadow-2xs gap-1.5"
          >
            {similarLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
            {similarLoading ? "Loading More..." : "Load More Similar Products"}
          </CustomButton>
        </div>
      )}
    </div>
  );
}
