


import React from "react";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";
import { CheckCircle2 } from "lucide-react";
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
  subtitle = "Handpicked products just for you",
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
      />

      <PaginatedProductsGrid
        products={products}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        isInitialLoading={isInitialLoading}
        sectionKey="featured"
        imageLoading={imageLoading}
      />

      {!hasMore && products.length > 0 && !loading && (
        <div className="flex flex-col items-center justify-center mt-8 py-6 px-4 rounded-2xl border border-border/60 bg-gradient-to-b from-muted/20 via-muted/10 to-background shadow-2xs">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 mb-2.5 shadow-2xs">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xs sm:text-sm font-extrabold text-foreground mb-1 text-center">
            You've seen it all! 🎉
          </h3>
          <p className="text-xs text-muted-foreground text-center max-w-md font-medium">
            You've reached the end of our featured products list. Check back soon for exciting new arrivals!
          </p>
        </div>
      )}
    </SectionWrapper>
  );
};


export const ProductsSection = React.memo(ProductsSectionComponent);
