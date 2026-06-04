


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
    return (
      <SectionWrapper>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-base mb-3">⚠️</div>
          <h3 className="text-xs font-semibold text-foreground mb-1.5">
            Error Loading Products
          </h3>
          <p className="text-muted-foreground text-center">
            There was an error loading products. Please try again later.
          </p>
        </div>
      </SectionWrapper>
    );
  }


  if (products.length === 0 && !loading && !isInitialLoading) {
    return (
      <SectionWrapper>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-base mb-3">📦</div>
          <h3 className="text-xs font-semibold text-foreground mb-1.5">
            No Products Available
          </h3>
          <p className="text-muted-foreground text-center">
            There are no products available at this time. Please check back later.
          </p>
        </div>
      </SectionWrapper>
    );
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
        <div className="flex flex-col items-center justify-center mt-7 py-5 px-3">
          <div className="flex items-center justify-center w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-primary/10 mb-3">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h3 className="text-xs sm:text-xs font-semibold mb-1.5 text-center">
            You've seen it all!
          </h3>
          <p className="text-xs sm:text-xs text-muted-foreground text-center max-w-md">
            You've reached the end of our featured products. Check back later
            for new arrivals!
          </p>
        </div>
      )}
    </SectionWrapper>
  );
};


export const ProductsSection = React.memo(ProductsSectionComponent);
