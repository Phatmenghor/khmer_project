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
  sectionKey = "product", // Default section identifier
}: PaginatedProductsGridProps) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastVisibleProductKeyRef = useRef<string | null>(null);
  const isPaginationLoading = loading && products.length > 0;
  const [paginationSkeletonCount, setPaginationSkeletonCount] = useState(6);
  const [newProductIds, setNewProductIds] = useState<Set<string>>(new Set());

  // Save MIDDLE visible product (50% of viewport) - best for scroll anchoring
  const saveLastVisibleProduct = useCallback(() => {
    if (!containerRef.current) return;

    const productCards = containerRef.current.querySelectorAll('[data-product-key]');
    const visibleProducts: HTMLElement[] = [];

    productCards.forEach((card) => {
      const rect = (card as HTMLElement).getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        visibleProducts.push(card as HTMLElement);
      }
    });

    // Save the MIDDLE visible product (not the last one at top)
    if (visibleProducts.length > 0) {
      const middleIndex = Math.floor(visibleProducts.length / 2);
      const middleProduct = visibleProducts[middleIndex];
      const middleKey = middleProduct.getAttribute('data-product-key');
      if (middleKey) {
        lastVisibleProductKeyRef.current = middleKey;
      }
    }
  }, []);

  // Scroll to product at center (50%) of viewport height - better visibility
  const scrollToProductAtCenter = useCallback(() => {
    if (!lastVisibleProductKeyRef.current || !containerRef.current) return;

    const targetElement = containerRef.current.querySelector(
      `[data-product-key="${lastVisibleProductKeyRef.current}"]`
    ) as HTMLElement;

    if (targetElement) {
      const viewportHeight = window.innerHeight;
      const targetPosition = viewportHeight * 0.5; // Center of screen
      const elementTop = targetElement.getBoundingClientRect().top + window.scrollY;
      const scrollPosition = elementTop - targetPosition;

      window.scrollTo({
        top: scrollPosition,
        behavior: "smooth"
      });
    }
  }, []);

  // Save position and track new products before fetch
  const handleLoadMoreWithScroll = useCallback(() => {
    // Save last visible product before fetch
    saveLastVisibleProduct();
    setNewProductIds(new Set());
    onLoadMore();
  }, [onLoadMore, saveLastVisibleProduct]);

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

  // Scroll to FIRST NEW PRODUCT when data arrives - show new products at top
  useEffect(() => {
    if (!isPaginationLoading && products.length > 0 && containerRef.current) {
      requestAnimationFrame(() => {
        // Get the first few new products
        const newProductElements = Array.from(
          containerRef.current?.querySelectorAll('[data-product-key]') || []
        ).slice(-paginationSkeletonCount * 2);

        if (newProductElements.length > 0) {
          const firstNewProduct = newProductElements[0] as HTMLElement;
          // Scroll first new product to TOP of screen
          const elementTop = firstNewProduct.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: elementTop - 100, // 100px from top for padding
            behavior: "smooth"
          });
        }
      });
    }
  }, [isPaginationLoading, products, paginationSkeletonCount]);

  // Track new products for animation (separate from scroll)
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
      { threshold: 0.1, rootMargin: "200px" }
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

        {/* Skeleton loaders ALWAYS show while hasMore: true - never hide */}
        {hasMore &&
          Array.from({ length: paginationSkeletonCount }).map((_, i) => (
            <div
              key={`skeleton-default-${i}`}
              className="animate-fade-in-up"
            >
              <ProductCardSkeleton />
            </div>
          ))}

        {/* Loading spinner ALWAYS show while hasMore: true - never hide */}
        {hasMore && (
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
