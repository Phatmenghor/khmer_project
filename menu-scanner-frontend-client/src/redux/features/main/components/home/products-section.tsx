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

import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
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
  const isPaginationLoading = loading && products.length > 0;
  const [skeletonCount, setSkeletonCount] = useState(8);
  const [paginationSkeletonCount, setPaginationSkeletonCount] = useState(6);

  // Maintain scroll position during pagination (YouTube-like UX)
  const { containerRef, savePositionNow } = useScrollAnchor(isPaginationLoading);

  // Wrapper to save position BEFORE fetch starts
  const handleLoadMoreWithScroll = useCallback(() => {
    // CRITICAL: Save position BEFORE API call starts (before skeletons appear)
    savePositionNow();
    // Then trigger the actual fetch
    onLoadMore();
  }, [onLoadMore, savePositionNow]);

  // Smart pagination with debounce and duplicate prevention
  const { handleLoadMore } = usePaginationLoadMore(
    handleLoadMoreWithScroll,
    hasMore && !loading,
    [hasMore, loading, handleLoadMoreWithScroll]
  );

  /**
   * Calculate skeleton loader count based on screen size
   * Matches grid layout: 2 cols (mobile) to 6 cols (desktop)
   */
  useEffect(() => {
    const updateSkeletonCount = () => {
      const width = window.innerWidth;

      // Initial load: 2 rows of skeletons
      if (width < 640) {
        setSkeletonCount(4); // 2 cols × 2 rows (mobile)
        setPaginationSkeletonCount(2); // 1 row for pagination
      } else if (width < 768) {
        setSkeletonCount(6); // 3 cols × 2 rows (tablet)
        setPaginationSkeletonCount(3); // 1 row for pagination
      } else if (width < 1024) {
        setSkeletonCount(8); // 4 cols × 2 rows (tablet)
        setPaginationSkeletonCount(4); // 1 row for pagination
      } else if (width < 1280) {
        setSkeletonCount(10); // 5 cols × 2 rows (desktop)
        setPaginationSkeletonCount(5); // 1 row for pagination
      } else {
        setSkeletonCount(12); // 6 cols × 2 rows (large desktop)
        setPaginationSkeletonCount(6); // 1 row for pagination
      }
    };

    updateSkeletonCount();
    window.addEventListener("resize", updateSkeletonCount);
    return () => window.removeEventListener("resize", updateSkeletonCount);
  }, []);

  /**
   * YouTube-style scroll behavior
   * Minimal scroll movement - just enough to show skeleton loaders
   * When products load, they replace skeletons seamlessly
   */
  useEffect(() => {
    if (isPaginationLoading && sentinelRef.current) {
      // Scroll sentinel into view so user sees loading progress
      sentinelRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest", // Minimal scroll - don't jump
      });
    }
  }, [isPaginationLoading]);

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
        {/* YouTube-style: Products + skeleton loaders in same grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
        >
          {/* Existing products */}
          {products.map((product) => (
            <ProductCard
              key={`featured-product-${product.id}`}
              product={product}
            />
          ))}

          {/* Skeleton loaders while fetching more products (YouTube style) */}
          {/* Appears inline with products - no separate loading message */}
          {isPaginationLoading &&
            Array.from({ length: paginationSkeletonCount }).map((_, index) => (
              <ProductCardSkeleton key={`skeleton-pagination-${index}`} />
            ))}

          {/* Sentinel for infinite scroll detection */}
          {/* Invisible element to trigger load when visible */}
          {hasMore && !loading && (
            <div
              ref={sentinelRef}
              className="h-10"
              aria-label="Load more products trigger"
            />
          )}
        </div>

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
