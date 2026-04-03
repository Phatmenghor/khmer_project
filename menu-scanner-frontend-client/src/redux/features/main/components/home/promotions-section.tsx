/**
 * PromotionsSection Component
 * Features:
 * - Fixed 4-row grid layout across all screen sizes
 * - Responsive columns (2-6)
 * - Attractive gradient background with decorative blur effect
 * - View All button for additional promotions
 * - Skeleton loading placeholders
 */

import React, { useState, useEffect } from "react";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductGridSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { Flame } from "lucide-react";
import {
  SectionWrapper,
  ViewAllButton,
} from "@/components/shared/common/section-header";

interface PromotionsSectionProps {
  products: ProductDetailResponseModel[];
  loading: boolean;
  error: string | null;
  title?: string;
}

/** Default section title for promotions */
const DEFAULT_TITLE = "Hot Deals & Promotions";

export const PromotionsSection = ({
  products,
  loading,
  error,
  title = DEFAULT_TITLE,
}: PromotionsSectionProps) => {
  const [limit, setLimit] = useState(24);

  /**
   * Calculate max products to display based on screen size
   * Always shows 4 rows to maintain consistent home page layout
   */
  useEffect(() => {
    const updateLimit = () => {
      const width = window.innerWidth;

      // Calculate: columns × 4 rows
      if (width < 640) {
        setLimit(8); // 2 cols × 4 rows (mobile)
      } else if (width < 768) {
        setLimit(12); // 3 cols × 4 rows (small tablet)
      } else if (width < 1024) {
        setLimit(16); // 4 cols × 4 rows (tablet)
      } else if (width < 1280) {
        setLimit(20); // 5 cols × 4 rows (desktop)
      } else {
        setLimit(24); // 6 cols × 4 rows (large desktop)
      }
    };

    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, []);

  const displayProducts = products?.slice(0, limit) || [];

  /**
   * Header Component - Reusable for both loading and content states
   * Features: gradient background, decorative blur, responsive sizing
   */
  const PromotionHeader = ({ showDecoration = false }) => (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 p-4 sm:p-6 md:p-8 mb-6 shadow-sm">
      {/* Decorative blur effect - only on content view */}
      {showDecoration && (
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-br from-red-200/20 to-orange-200/20 dark:from-red-800/10 dark:to-orange-800/10 rounded-full blur-3xl" />
      )}

      <div className="relative">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2 mb-2">
          <Flame
            className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-red-500 flex-shrink-0"
            aria-label="Hot deals icon"
          />
          {title}
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Limited time offers - Don't miss out! 🎁
        </p>
      </div>
    </div>
  );

  // Loading state - show skeleton placeholders
  if (loading) {
    return (
      <SectionWrapper>
        <PromotionHeader showDecoration={false} />
        <ProductGridSkeleton count={limit} />
      </SectionWrapper>
    );
  }

  // Error or empty state - don't show section
  if (error || !displayProducts || displayProducts.length === 0) {
    if (error) {
      console.error("PromotionsSection error:", error);
    }
    return null;
  }

  // Content state with products and decoration
  return (
    <SectionWrapper>
      <PromotionHeader showDecoration={true} />

      {/* Responsive Product Grid: 2 cols (mobile) to 6 cols (desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {displayProducts.map((product) => (
          <ProductCard
            key={`promotion-product-${product.id}`}
            product={product}
          />
        ))}
      </div>

      {/* Show "View All" button if there are more promotions available */}
      {products.length > limit && (
        <ViewAllButton href="/promotions" text="View All Deals" />
      )}
    </SectionWrapper>
  );
};
