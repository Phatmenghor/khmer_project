/**
 * ProductsSection Component
 * Features:
 * - Infinite scroll pagination with smart debounce and duplicate prevention
 * - Responsive grid layout (2-6 columns)
 * - Skeleton loading placeholders for initial load
 * - Scroll position maintenance during pagination
 * - Loading icon only (no skeletons) during pagination
 * - Empty state and error handling
 * - Performance optimized for smooth scrolling
 */

import React, { useRef, useEffect, useState, useMemo } from "react";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductCardSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import {
  SectionHeader,
  SectionWrapper,
} from "@/components/shared/common/section-header";
import { useScrollAnchor } from "@/hooks/use-scroll-anchor";
import { usePaginationLoadMore } from "@/hooks/use-pagination-load-more";

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
 * Memoized component to prevent unnecessary re-renders
 * Only re-renders when props actually change
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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const prevProductCountRef = useRef(0);
  const isPaginationLoading = loading && products.length > 0;
  const [skeletonCount, setSkeletonCount] = useState(8);

  // Smart pagination with debounce and duplicate prevention
  const { handleLoadMore } = usePaginationLoadMore(
    onLoadMore,
    hasMore && !loading,
    [hasMore, loading, onLoadMore]
  );

  // Maintain scroll position during pagination (YouTube-like UX)
  const { containerRef } = useScrollAnchor(isPaginationLoading);

  /**
   * Calculate skeleton loader count based on screen size
   * Matches grid layout: 2 cols (mobile) to 6 cols (desktop)
   * Showing 2 rows of skeletons while loading initial data
   */
  useEffect(() => {
    const updateSkeletonCount = () => {
      const width = window.innerWidth;

      // Skeleton count = columns × 2 rows for initial load
      if (width < 640) {
        setSkeletonCount(4); // 2 cols × 2 rows (mobile)
      } else if (width < 768) {
        setSkeletonCount(6); // 3 cols × 2 rows (tablet)
      } else if (width < 1024) {
        setSkeletonCount(8); // 4 cols × 2 rows (tablet)
      } else if (width < 1280) {
        setSkeletonCount(10); // 5 cols × 2 rows (desktop)
      } else {
        setSkeletonCount(12); // 6 cols × 2 rows (large desktop)
      }
    };

    updateSkeletonCount();
    window.addEventListener("resize", updateSkeletonCount);
    return () => window.removeEventListener("resize", updateSkeletonCount);
  }, []);

  /**
   * Auto-scroll to newly loaded products
   * When fetch completes, scroll to show new products for easy review
   * Prevents immediate re-trigger of observer
   */
  useEffect(() => {
    // When products increase AND loading just finished
    if (!loading && products.length > prevProductCountRef.current && prevProductCountRef.current > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (gridRef.current) {
          // Get the scroll position to show new products in middle of viewport
          const gridRect = gridRef.current.getBoundingClientRect();
          const scrollTarget = gridRect.top + window.scrollY - 100; // 100px from top for padding

          window.scrollTo({
            top: scrollTarget,
            behavior: "smooth",
          });
        }
      }, 100);
    }

    // Update previous count after products are updated
    prevProductCountRef.current = products.length;
  }, [products.length, loading]);

  /**
   * Smart Intersection Observer for infinite scroll
   * Features:
   * - Triggers when sentinel reaches viewport
   * - Integrates with usePaginationLoadMore for debounce and duplicate prevention
   * - Automatically cleans up when hasMore is false
   * - NO early rootMargin to prevent immediate re-trigger after loading
   * - Only triggers when user actually scrolls to sentinel
   */
  useEffect(() => {
    // Only create observer if we have more products to load
    if (!hasMore || !sentinelRef.current) {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    // Create observer that triggers only when sentinel is actually visible
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // Trigger load when sentinel becomes visible in viewport
        // The handleLoadMore function internally prevents duplicate calls
        if (entry.isIntersecting) {
          handleLoadMore();
        }
      },
      {
        threshold: 0.1, // Trigger at 10% visibility
        rootMargin: "0px", // No early trigger - wait until actually in viewport
      }
    );

    // Start observing the sentinel element
    observerRef.current = observer;
    observer.observe(sentinelRef.current);

    // Cleanup: disconnect observer on unmount or when conditions change
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [hasMore, handleLoadMore]);

  // Initial loading state - show skeleton placeholders
  if (isInitialLoading) {
    return (
      <SectionWrapper>
        <SectionHeader
          title={title}
          subtitle={subtitle}
          icon={showIcon ? Sparkles : undefined}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <ProductCardSkeleton key={`skeleton-initial-${index}`} />
          ))}
        </div>
      </SectionWrapper>
    );
  }

  // Error state - don't show section
  if (error) {
    console.error("ProductsSection error:", error);
    return null;
  }

  // Empty state - no products and not loading
  if (products.length === 0 && !loading) {
    return null;
  }

  return (
    <SectionWrapper>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        icon={showIcon ? Sparkles : undefined}
      />

      <div ref={containerRef}>
        {/* Responsive Product Grid: 2 cols (mobile) to 6 cols (desktop) */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
        >
          {/* Product cards */}
          {products.map((product) => (
            <ProductCard
              key={`featured-product-${product.id}`}
              product={product}
            />
          ))}
        </div>

        {/* Loading state indicator */}
        {isPaginationLoading && (
          <div className="flex items-center justify-center py-6 mt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              <span className="text-xs sm:text-sm">
                Loading more products...
              </span>
            </div>
          </div>
        )}

        {/* Spacer between products and sentinel to prevent immediate re-trigger */}
        {/* Only show spacer when not loading to push sentinel below viewport */}
        {hasMore && !loading && <div className="h-32 sm:h-40 md:h-48" />}

        {/* Infinite scroll sentinel - triggers load when visible */}
        {/* User must scroll down to this element to load more */}
        {hasMore && !loading && (
          <div
            ref={sentinelRef}
            className="h-10"
            aria-label="Load more products trigger"
          />
        )}

        {/* End of products state */}
        {!hasMore && products.length > 0 && (
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
      </div>
    </SectionWrapper>
  );
};

/**
 * Export memoized component
 * Prevents re-renders when parent updates but props remain the same
 * Critical for infinite scroll performance - prevents observer recreation
 */
export const ProductsSection = React.memo(ProductsSectionComponent);
