/**
 * ProductsSection Component
 * Features:
 * - Infinite scroll pagination with smart debounce
 * - Product key-based scroll anchoring
 * - Smooth fade-in animations for new products
 * - Responsive grid layout (2-6 columns)
 * - Skeleton loading placeholders for initial load
 * - Empty state and error handling
 * - Performance optimized with React.memo
 */

import React from "react";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
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
}

/**
 * Wrapper component that uses the reusable PaginatedProductsGrid
 * Handles section layout, header, and end-of-products message
 */
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
}: ProductsSectionProps) => {
  // Error state - don't show section
  if (error) {
    console.error("ProductsSection error:", error);
    return null;
  }

  // Empty state - no products and not loading
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

      {/* Use reusable grid component for pagination logic */}
      <PaginatedProductsGrid
        products={products}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        isInitialLoading={isInitialLoading}
        sectionKey="featured"
      />

      {/* End of products state */}
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

/**
 * Export memoized component
 * Prevents re-renders when parent updates but props remain the same
 * Critical for infinite scroll performance - prevents observer recreation
 */
export const ProductsSection = React.memo(ProductsSectionComponent);
