import React, { useRef, useEffect, useState } from "react";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductCardSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import {
  SectionHeader,
  SectionWrapper,
} from "@/components/shared/common/section-header";
import { useScrollAnchor } from "@/hooks/use-scroll-anchor";

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

export const ProductsSection = ({
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
  const observerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(hasMore);
  const onLoadMoreRef = useRef(onLoadMore);
  const isPaginationLoading = loading && products.length > 0;
  const [skeletonCount, setSkeletonCount] = useState(30);

  // Maintain scroll position during load more (YouTube-like)
  const { containerRef } = useScrollAnchor(isPaginationLoading);

  useEffect(() => {
    const updateSkeletonCount = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setSkeletonCount(4); // 2 cols × 2 rows
      } else if (width < 768) {
        setSkeletonCount(6); // 3 cols × 2 rows
      } else if (width < 1024) {
        setSkeletonCount(8); // 4 cols × 2 rows
      } else if (width < 1280) {
        setSkeletonCount(10); // 5 cols × 2 rows
      } else {
        setSkeletonCount(12); // 6 cols × 2 rows
      }
    };

    updateSkeletonCount();
    window.addEventListener("resize", updateSkeletonCount);
    return () => window.removeEventListener("resize", updateSkeletonCount);
  }, []);

  // Keep refs updated
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  // Intersection observer - only recreate when necessary
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        // Use refs to get latest values without recreating observer
        // Prevent multiple simultaneous fetches with loadingRef check
        if (
          first.isIntersecting &&
          hasMoreRef.current &&
          !loadingRef.current
        ) {
          onLoadMoreRef.current();
        }
      },
      { threshold: 0.1, rootMargin: "200px" },
    );

    const currentObserver = observerRef.current;
    if (currentObserver && hasMore && !loading) {
      observer.observe(currentObserver);
    }

    return () => {
      if (currentObserver) {
        observer.unobserve(currentObserver);
      }
      observer.disconnect();
    };
  }, [hasMore, loading]);

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
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </SectionWrapper>
    );
  }

  // Don't show section if there's an error
  if (error) {
    return null;
  }

  // Show empty state only if not loading and no products
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
        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}

          {/* Show skeleton cards while loading more - smooth inline loading (like YouTube) */}
          {isPaginationLoading &&
            Array.from({ length: skeletonCount }).map((_, index) => (
              <ProductCardSkeleton key={`loading-${index}`} />
            ))}
        </div>

        {/* Loading indicator with icon */}
        {isPaginationLoading && (
          <div className="flex items-center justify-center py-6 mt-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading more products...</span>
            </div>
          </div>
        )}

        {/* Infinite scroll trigger - hidden */}
        {hasMore && !loading && <div ref={observerRef} className="h-10" />}

        {/* End of products message */}
        {!hasMore && products.length > 0 && (
          <div className="flex flex-col items-center justify-center mt-10 py-8">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">You've seen it all!</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              You've reached the end of our featured products. Check back later
              for new arrivals!
            </p>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};
