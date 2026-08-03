


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
    <div className="relative overflow-hidden rounded-[16px] border border-orange-500/20 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/5 dark:from-red-950/30 dark:via-orange-950/20 dark:to-amber-950/10 p-4 sm:p-5 mb-5 shadow-2xs">
      {showDecoration && (
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-red-500/20 to-amber-500/20 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-red-500/15 text-red-500 shrink-0">
              <Flame className="h-4 w-4 sm:h-5 sm:w-5" aria-label="Hot deals icon" />
            </span>
            <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            <span className="text-[10px] sm:text-[11px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 px-2.5 py-0.5 rounded-full border border-red-500/20">
              Limited Offer
            </span>
          </div>
          <p className="text-xs sm:text-xs text-muted-foreground mt-1 font-normal">
            Limited time offers — Don't miss out on special discounts! 🎁
          </p>
        </div>
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
