


import React, { useState, useEffect } from "react";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductGridSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";
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


const DEFAULT_TITLE = "Hot Deals & Promotions";


const PromotionsSectionComponent = ({
  products,
  loading,
  error,
  title = DEFAULT_TITLE,
}: PromotionsSectionProps) => {
  const [limit, setLimit] = useState(24);


  useEffect(() => {
    const updateLimit = () => {
      const width = window.innerWidth;


      if (width < 640) {
        setLimit(8);
      } else if (width < 768) {
        setLimit(12);
      } else if (width < 1024) {
        setLimit(16);
      } else if (width < 1280) {
        setLimit(20);
      } else {
        setLimit(24);
      }
    };

    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, []);

  const displayProducts = products?.slice(0, limit) || [];


  const PromotionHeader = ({ showDecoration = false }) => (
    <div className="relative overflow-hidden rounded bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 p-3 sm:p-4 md:p-5 mb-4 shadow-sm">
      {}
      {showDecoration && (
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-44 sm:h-44 bg-gradient-to-br from-red-200/20 to-orange-200/20 dark:from-red-800/10 dark:to-orange-800/10 rounded-full blur-3xl" />
      )}

      <div className="relative">
        <h2 className="text-xs sm:text-sm md:text-xs font-bold tracking-tight flex items-center gap-1 mb-1">
          <Flame
            className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-red-500 flex-shrink-0"
            aria-label="Hot deals icon"
          />
          {title}
        </h2>
        <p className="text-muted-foreground text-xs sm:text-xs">
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
    return null;
  }


  return (
    <SectionWrapper>
      <PromotionHeader showDecoration={true} />

      {}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
        {displayProducts.map((product, index) => (
          <ProductCard
            key={`promotion-product-${product.id}`}
            product={product}
            imageLoading="eager"
          />
        ))}
      </div>

      {}
      <ViewAllButton href="/promotions" text="View More Promotions" />
    </SectionWrapper>
  );
};


export const PromotionsSection = React.memo(PromotionsSectionComponent);
