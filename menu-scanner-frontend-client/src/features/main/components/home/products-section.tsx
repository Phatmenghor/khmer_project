


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
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
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
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
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
