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

export const PromotionsSection = ({
  products,
  loading,
  error,
  title = "Hot Deals & Promotions",
}: PromotionsSectionProps) => {
  const [limit, setLimit] = useState(24);

  useEffect(() => {
    const updateLimit = () => {
      const width = window.innerWidth;

      // Show only 4 rows for better UI/UX on home page
      if (width < 640) setLimit(8); // 2 columns × 4 rows
      else if (width < 768) setLimit(12); // 3 columns × 4 rows
      else if (width < 1024) setLimit(16); // 4 columns × 4 rows
      else if (width < 1280) setLimit(20); // 5 columns × 4 rows
      else setLimit(24); // 6 columns × 4 rows
    };

    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, []);

  const displayProducts = products?.slice(0, limit) || [];

  if (loading) {
    return (
      <SectionWrapper>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 p-4 sm:p-6 mb-6 shadow-sm">
          <div className="relative">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2 mb-2">
              <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
              {title}
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Limited time offers - Don't miss out!
            </p>
          </div>
        </div>
        <ProductGridSkeleton count={limit} />
      </SectionWrapper>
    );
  }

  if (error || !displayProducts || displayProducts.length === 0) {
    return null;
  }

  return (
    <SectionWrapper>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 p-4 sm:p-6 md:p-8 mb-6 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-br from-red-200/20 to-orange-200/20 dark:from-red-800/10 dark:to-orange-800/10 rounded-full blur-3xl" />

        <div className="relative">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2 mb-2">
            <Flame className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-red-500" />
            {title}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Limited time offers - Don't miss out! 🎁
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {displayProducts.map((product, index) => (
          <ProductCard key={`promo-${product.id}`} product={product} />
        ))}
      </div>

      {products.length > limit && (
        <ViewAllButton
          href="/promotions"
          text="View All Deals"
        />
      )}
    </SectionWrapper>
  );
};
