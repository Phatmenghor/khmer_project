/**
 * PaginatedProductsGrid - Reusable infinite scroll component
 * Features:
 * - Infinite scroll pagination with smart debounce
 * - Product key-based scroll anchoring (stays on same product while loading)
 * - Smooth fade-in animations for new products
 * - Responsive grid (2-6 columns)
 * - Skeleton loaders during pagination
 * - Works on any page (Home, Products, Categories, etc.)
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductCardSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { useScrollAnchor } from "@/hooks/use-scroll-anchor";
import { usePaginationLoadMore } from "@/hooks/use-pagination-load-more";
import { Loader2 } from "lucide-react";

interface PaginatedProductsGridProps {
  products: ProductDetailResponseModel[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  isInitialLoading?: boolean;
  className?: string;
  sectionKey?: string; // Unique section identifier (e.g., "home", "products", "promo")
}

const PaginatedProductsGridComponent = ({
  products,
  loading,
  hasMore,
  onLoadMore,
  isInitialLoading = false,
  className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4",
  sectionKey = "product", // Default section key
}: PaginatedProductsGridProps) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isPaginationLoading = loading && products.length > 0;
  const [paginationSkeletonCount, setPaginationSkeletonCount] = useState(6);
  const [newProductIds, setNewProductIds] = useState<Set<string>>(new Set());

  // Scroll anchor using product keys
  const { containerRef, savePositionNow } = useScrollAnchor(isPaginationLoading);

  // Save position and track new products before fetch
  const handleLoadMoreWithScroll = useCallback(() => {
    // Save current last visible product key
    savePositionNow();
    // Clear new product animation after previous load
    setNewProductIds(new Set());
    // Trigger fetch
    onLoadMore();
  }, [onLoadMore, savePositionNow]);

  // Smart pagination with debounce
  const { handleLoadMore } = usePaginationLoadMore(
    handleLoadMoreWithScroll,
    hasMore && !loading,
    [hasMore, loading, handleLoadMoreWithScroll]
  );

  // Calculate skeleton count based on screen size
  const calculateSkeletonCount = useCallback(() => {
    const width = window.innerWidth;
    if (width < 640) setPaginationSkeletonCount(2);
    else if (width < 768) setPaginationSkeletonCount(3);
    else if (width < 1024) setPaginationSkeletonCount(4);
    else if (width < 1280) setPaginationSkeletonCount(5);
    else setPaginationSkeletonCount(6);
  }, []);

  // Handle window resize
  useEffect(() => {
    calculateSkeletonCount();
    window.addEventListener("resize", calculateSkeletonCount);
    return () => window.removeEventListener("resize", calculateSkeletonCount);
  }, [calculateSkeletonCount]);

  // Track new products for animation
  useEffect(() => {
    if (!isPaginationLoading && products.length > 0) {
      const newIds = new Set(
        products.slice(-paginationSkeletonCount * 2).map((p) => p.id.toString())
      );
      setNewProductIds(newIds);
    }
  }, [isPaginationLoading, products, paginationSkeletonCount]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || !sentinelRef.current) {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "0px" }
    );

    observerRef.current = observer;
    observer.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [hasMore, handleLoadMore]);

  // Initial loading - show skeleton grid
  if (isInitialLoading) {
    return (
      <div className={className}>
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={`skeleton-initial-${i}`} />
        ))}
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef}>
      <div className={className}>
        {/* Real products with smooth fade-in animation for new items */}
        {products.map((product, index) => {
          const isNew = newProductIds.has(product.id.toString());
          // Use unique key: {section}-{product-id}-{index}
          // Example: "home-product-123-0", "promo-product-456-1"
          const uniqueKey = `${sectionKey}-${product.id}-${index}`;
          return (
            <div
              key={uniqueKey}
              data-product-key={`product-${product.id}`}
              className={`transition-all duration-500 ease-out ${
                isNew ? "animate-fade-in-up" : ""
              }`}
            >
              <ProductCard product={product} />
            </div>
          );
        })}

        {/* Skeleton loaders ALWAYS show while hasMore is true - visual indicator of more products coming */}
        {hasMore &&
          Array.from({ length: paginationSkeletonCount }).map((_, i) => (
            <div
              key={`skeleton-default-${i}`}
              className={`animate-fade-in-up ${
                isPaginationLoading ? "opacity-100" : "opacity-50"
              } transition-opacity duration-300`}
            >
              <ProductCardSkeleton />
            </div>
          ))}

        {/* Loading spinner in grid space - show only during actual pagination */}
        {isPaginationLoading && (
          <div className="col-span-full flex flex-col items-center justify-center py-8 animate-fade-in-up">
            <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              Loading more products...
            </p>
          </div>
        )}

        {/* Sentinel element for scroll detection */}
        {hasMore && !loading && (
          <div
            ref={sentinelRef}
            className="h-10"
            aria-label="Load more products trigger"
          />
        )}
      </div>
    </div>
  );
};

export const PaginatedProductsGrid = React.memo(
  PaginatedProductsGridComponent
);
