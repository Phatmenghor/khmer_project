


import React from "react";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";
import { Sparkles, CheckCircle2 } from "lucide-react";
import {
  SectionHeader,
  SectionWrapper,
} from "@/components/shared/common/section-header";
import { PaginatedProductsGrid } from "@/components/shared/grid/paginated-products-grid";
import { ProductCardSkeleton } from "@/components/shared/skeletons/product-card-skeleton";

interface ProductsSectionProps {
  products: ProductDetailResponseModel[];
  loading: boolean;
  error: string | null;
  title?: string;
  subtitle?: string;
  showIcon?: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  isInitialLoading?: boolean;
  imageLoading?: "eager" | "lazy";
}


const ProductsSectionComponent = ({
  products,
  loading,
  error,
  title = "Featured Products",
  subtitle,
  showIcon = false,
  hasMore,
  onLoadMore,
  isInitialLoading = false,
  imageLoading = "lazy",
}: ProductsSectionProps) => {

  if (error) {
    return null;
  }


  if (products.length === 0 && !loading && !isInitialLoading) {
    return null;
  }

  return (
    <SectionWrapper>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        icon={showIcon ? Sparkles : undefined}
      />

      {}
      <PaginatedProductsGrid
        products={products}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        isInitialLoading={isInitialLoading}
        sectionKey="featured"
        imageLoading={imageLoading}
      />

      {}
      {!hasMore && products.length > 0 && !loading && (
        <div className="flex flex-col items-center justify-center mt-10 py-8 px-4">
          <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-4">
            <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-2 text-center">
            You've seen it all!
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-md">
            You've reached the end of our featured products. Check back later
            for new arrivals!
          </p>
        </div>
      )}
    </SectionWrapper>
  );
};


export const ProductsSection = React.memo(ProductsSectionComponent);
