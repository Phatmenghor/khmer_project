"use client";

import { useEffect, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { fetchPublicProducts } from "@/redux/features/main/store/thunks/public-product-thunks";
import {
  clearProducts,
  setLoadedFilters,
} from "@/redux/features/main/store/slice/public-product-slice";
import { usePublicProductState } from "@/redux/features/main/store/state/public-product-state";
import { ProductCardSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { CheckCircle2, Flame } from "lucide-react";
import { PageContainer } from "@/components/shared/common/page-container";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { PaginatedProductsGrid } from "@/components/shared/grid/paginated-products-grid";
import { usePaginationLoadMore } from "@/hooks/use-pagination-load-more";

// Dynamically import ProductFilters to avoid SSR hydration mismatch
const ProductFilters = dynamic(
  () => import("@/redux/features/main/components/product/product-filters").then(
    (mod) => ({ default: mod.ProductFilters })
  ),
  { ssr: false, loading: () => <div className="w-72 h-96 bg-muted animate-pulse rounded-lg" /> }
);

interface ProductListPageProps {
  basePath?: string;
  lockedPromotion?: boolean;
  hero?: React.ReactNode;
  scrollKey?: string;
}

export function ProductListPage({
  basePath = "/products",
  lockedPromotion = false,
  hero,
  scrollKey = "products",
}: ProductListPageProps) {
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { dispatch, products, pagination, loading, loadedFilters } =
    usePublicProductState();

  // Always start at top on page load/refresh - don't restore scroll
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useScrollRestoration({
    enabled: true,
    restoreOnMount: false, // Disable on mount to prevent restoring bottom scroll
    customKey: scrollKey,
    restoreDelay: 150,
  });

  const search = lockedPromotion ? null : searchParams.get("q");
  const categoryId = searchParams.get("categoryId");
  const brandId = searchParams.get("brandId");
  const statusParam = searchParams.get("status");
  const statuses = statusParam?.split(",").filter(Boolean) ?? [];
  const sortBy = searchParams.get("sortBy");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const currentFilters = JSON.stringify({
    search,
    hasPromotion: lockedPromotion
      ? true
      : searchParams.get("hasPromotion") === "true",
    categoryId,
    brandId,
    statuses,
    sortBy,
    minPrice,
    maxPrice,
    _page: basePath,
  });

  // Dynamic page size based on screen width (like home page)
  const getPageSize = useCallback(() => {
    if (typeof window === "undefined") return 20;
    const width = window.innerWidth;
    if (width >= 1280) return 36;
    if (width >= 768) return 20;
    return 15;
  }, []);

  const loadProducts = useCallback(
    async (pageNo: number) => {
      const hasPromotion = lockedPromotion
        ? true
        : searchParams.get("hasPromotion") === "true" || undefined;

      await dispatch(
        fetchPublicProducts({
          pageNo,
          pageSize: getPageSize(),
          ...(search && { search }),
          ...(hasPromotion && { hasPromotion: true }),
          ...(categoryId && { categoryId }),
          ...(brandId && { brandId }),
          ...(statuses.length > 0 && { statuses }),
          ...(sortBy && { sortBy }),
          ...(minPrice && { minPrice: Number(minPrice) }),
          ...(maxPrice && { maxPrice: Number(maxPrice) }),
        }),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      dispatch,
      search,
      lockedPromotion,
      searchParams,
      categoryId,
      brandId,
      statusParam,
      sortBy,
      minPrice,
      maxPrice,
      getPageSize,
    ],
  );

  // Handle load more - append mode (oldData + newData)
  const handleLoadMore = useCallback(() => {
    if (pagination.hasMore && !loading.list && products.length > 0) {
      const nextPage = pagination.currentPage + 1;
      loadProducts(nextPage);
    }
  }, [pagination.hasMore, pagination.currentPage, loading.list, products.length, loadProducts]);

  // Trigger load more
  const handleLoadMoreWithScroll = useCallback(() => {
    handleLoadMore();
  }, [handleLoadMore]);

  // Smart pagination with debounce (300ms) - same as home page
  const { handleLoadMore: debouncedLoadMore } = usePaginationLoadMore(
    handleLoadMoreWithScroll,
    pagination.hasMore && !loading.list,
    [pagination.hasMore, loading.list, handleLoadMoreWithScroll]
  );

  // Initial filter load
  useEffect(() => {
    const hasProductsInStore = products.length > 0;
    const filtersMatch = loadedFilters === currentFilters;

    if (hasProductsInStore && filtersMatch) {
      return;
    }

    if (!filtersMatch || !hasProductsInStore) {
      if (!filtersMatch && hasProductsInStore) {
        dispatch(clearProducts());
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      dispatch(setLoadedFilters(currentFilters));
      loadProducts(1);
    }
  }, [currentFilters, loadedFilters, products.length, loadProducts, dispatch]);

  const isInitialLoad = products.length === 0 && loading.list;
  const noSearch = lockedPromotion ? undefined : search;

  return (
    <div className="min-h-screen bg-background">
      {/* Optional hero section */}
      {hero && (
        <div className="relative">
          <PageContainer className="pt-3 sm:pt-6 pb-0">
            <div className="mb-6">{hero}</div>
          </PageContainer>
        </div>
      )}

      {/* Products Section with home page styling */}
      <div className="relative py-6 sm:py-10">
        <PageContainer>
          <div className="flex gap-6 lg:gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <ProductFilters
                totalResults={pagination.totalElements}
                basePath={basePath}
                lockedPromotion={lockedPromotion}
              />
            </aside>

            {/* Main Product List */}
            <div className="flex-1 min-w-0">
              {/* Mobile Filters */}
              <div className="lg:hidden mb-6">
                <ProductFilters
                  totalResults={pagination.totalElements}
                  basePath={basePath}
                  lockedPromotion={lockedPromotion}
                />
              </div>

              {/* Products Grid - with initial skeleton loading (like home page) */}
              {isInitialLoad ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <ProductCardSkeleton key={`skeleton-initial-${i}`} />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  <PaginatedProductsGrid
                    products={products}
                    loading={loading.list}
                    hasMore={pagination.hasMore}
                    onLoadMore={debouncedLoadMore}
                    isInitialLoading={false}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
                    sectionKey={lockedPromotion ? "promotions" : "products"}
                  />

                  {/* End of products state */}
                  {!pagination.hasMore && products.length > 0 && !loading.list && (
                    <div className="flex flex-col items-center justify-center mt-10 py-8">
                      <div
                        className={`flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                          lockedPromotion ? "bg-orange-500/10" : "bg-primary/10"
                        }`}
                      >
                        <CheckCircle2
                          className={`h-8 w-8 ${lockedPromotion ? "text-orange-500" : "text-primary"}`}
                        />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {lockedPromotion
                          ? "All deals loaded!"
                          : "You've seen it all!"}
                      </h3>
                      <p className="text-sm text-muted-foreground text-center max-w-md">
                        {lockedPromotion
                          ? "You've seen all current promotions. Check back later for new deals!"
                          : "You've reached the end of products. Check back later for new arrivals!"}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* No Results */
                <div className="text-center py-16">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4 mx-auto">
                    {lockedPromotion ? (
                      <Flame className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {lockedPromotion ? "No deals found" : "No products found"}
                  </h3>
                  <p className="text-muted-foreground">
                    {noSearch
                      ? `No results for "${noSearch}". Try different keywords.`
                      : lockedPromotion
                        ? "Try adjusting your filters or check back later for new promotions."
                        : "Try adjusting your filters or check back later"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </PageContainer>
      </div>
    </div>
  );
}
