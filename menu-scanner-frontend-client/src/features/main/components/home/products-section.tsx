


import React from "react";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";
import { Sparkles, CheckCircle2 } from "lucide-react";
import {
  SectionHeader,
  SectionWrapper,
} from "@/components/shared/common/section-header";
import { PaginatedProductsGrid } from "@/components/shared/grid/paginated-products-grid";
import { ProductCardSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { PageState } from "@/components/shared/page-state";

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
        <PageState
          type="error"
          title="Error Loading Products"
          description="There was an error loading products. Please try again later."
          size="sm"
        />
      </SectionWrapper>
    );
  }

  if (products.length === 0 && !loading && !isInitialLoading) {
    return (
      <SectionWrapper>
        <PageState
          type="empty"
          title="No Products Available"
          description="There are no products available at this time. Please check back later."
          size="sm"
        />
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
          <h3 className="text-xs sm:text-xs font-semibold mb-1 text-center">
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
