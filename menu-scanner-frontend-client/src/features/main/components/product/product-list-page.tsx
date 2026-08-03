"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { fetchPublicProducts } from "@/features/main/store/thunks/public-product-thunks";
import {
  clearProducts,
  setLoadedFilters,
} from "@/features/main/store/slice/public-product-slice";
import { usePublicProductState } from "@/features/main/store/state/public-product-state";
import { CheckCircle2 } from "lucide-react";
import { PageContainer } from "@/components/shared/common/page-container";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { PaginatedProductsGrid } from "@/components/shared/grid/paginated-products-grid";
import { usePaginationLoadMore } from "@/hooks/use-pagination-load-more";
import { PageState } from "@/components/shared/page-state";


const ProductFilters = dynamic(
  () =>
    import("@/features/main/components/product/product-filters").then(
      (mod) => ({ default: mod.ProductFilters }),
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-52 h-64 bg-muted animate-pulse rounded" />
    ),
  },
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
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { dispatch, products, pagination, loading, loadedFilters } =
    usePublicProductState();


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useScrollRestoration({
    enabled: true,
    restoreOnMount: false,
    customKey: scrollKey,
    restoreDelay: 150,
  });

  const search = searchParams.get("q");
  const categoryId = searchParams.get("categoryId");
  const brandId = searchParams.get("brandId");
  // Public pages always show ACTIVE products only — no status filter in UI.
  const statuses = ["ACTIVE"];
  const sortBy = searchParams.get("sortBy");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");


  const currentFilters = useMemo(
    () =>
      JSON.stringify({
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
      }),
    [
      search,
      lockedPromotion,
      searchParams,
      categoryId,
      brandId,
      statuses,
      sortBy,
      minPrice,
      maxPrice,
      basePath,
    ]
  );


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
      sortBy,
      getPageSize,
    ],
  );

  const filteredProducts = useMemo(() => {
    if (!minPrice && !maxPrice) return products;
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    return products.filter((p: any) => {
      const price = p.displayPrice ?? p.price ?? 0;
      if (min !== null && price < min) return false;
      if (max !== null && price > max) return false;
      return true;
    });
  }, [products, minPrice, maxPrice]);

  const handleLoadMore = useCallback(() => {
    if (pagination.hasMore && !loading.list && products.length > 0) {
      const nextPage = pagination.currentPage + 1;
      loadProducts(nextPage);
    }
  }, [
    pagination.hasMore,
    pagination.currentPage,
    loading.list,
    products.length,
    loadProducts,
  ]);

  const { handleLoadMore: debouncedLoadMore } = usePaginationLoadMore(
    handleLoadMore,
    pagination.hasMore && !loading.list,
    [pagination.hasMore, loading.list, handleLoadMore],
  );

  useEffect(() => {
    const hasProductsInStore = products.length > 0;
    const filtersMatch = loadedFilters === currentFilters;

    if (hasProductsInStore && filtersMatch) {
      return;
    }

    if (loading.list) {
      return;
    }

    if (!filtersMatch) {
      if (hasProductsInStore) {
        dispatch(clearProducts());
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      dispatch(setLoadedFilters(currentFilters));
      loadProducts(1);
    }
  }, [currentFilters, loadedFilters, products.length, dispatch, loading.list]);

  const isInitialLoad = !mounted || (products.length === 0 && loading.list);
  const noSearch = lockedPromotion ? undefined : search;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header slot */}
      {hero && (
        <div className="relative">
          <PageContainer className="max-w-8xl pt-2 max sm:pt-4 pb-0">
            <div className="mb-4">{hero}</div>
          </PageContainer>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="relative py-4 sm:py-7">
        <PageContainer className="max-w-8xl">
          <div className="flex gap-4 lg:gap-5 flex-col lg:flex-row">
            {/* Sidebar Filters */}
            <ProductFilters
              totalResults={filteredProducts.length}
              basePath={basePath}
              lockedPromotion={lockedPromotion}
            />

            {/* Product Grid Area */}
            <div className="flex-1 min-w-0">
              {/* Empty / No Results State */}
              {mounted && !loading.list && filteredProducts.length === 0 && (
                <PageState
                  type={noSearch ? "no-results" : "empty"}
                  title={lockedPromotion ? "No deals found" : "No products found"}
                  description={
                    noSearch
                      ? `No results for "${noSearch}". Try different keywords.`
                      : lockedPromotion
                        ? "Try adjusting your filters or check back later for new promotions."
                        : "Try adjusting your filters or check back later."
                  }
                  size="md"
                />
              )}

              {/* Product Grid & Infinite Scroll */}
              {(filteredProducts.length > 0 || isInitialLoad) && (
                <>
                  <PaginatedProductsGrid
                    products={filteredProducts}
                    loading={loading.list}
                    hasMore={pagination.hasMore}
                    onLoadMore={debouncedLoadMore}
                    isInitialLoading={isInitialLoad}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3"
                    sectionKey={lockedPromotion ? "promotions" : "products"}
                  />

                  {/* End of results message */}
                  {!pagination.hasMore && filteredProducts.length > 0 && !loading.list && (
                    <div className="flex flex-col items-center justify-center mt-7 py-5">
                      <div
                        className={`flex items-center justify-center w-11 h-11 rounded-full mb-3 ${
                          lockedPromotion ? "bg-orange-500/10" : "bg-primary/10"
                        }`}
                      >
                        <CheckCircle2
                          className={`h-5 w-5 ${lockedPromotion ? "text-orange-500" : "text-primary"}`}
                        />
                      </div>
                      <h3 className="text-xs font-semibold mb-1">
                        {lockedPromotion ? "All deals loaded!" : "You've seen it all!"}
                      </h3>
                      <p className="text-xs text-muted-foreground text-center max-w-md">
                        {lockedPromotion
                          ? "You've seen all current promotions. Check back later for new deals!"
                          : "You've reached the end of products. Check back later for new arrivals!"}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </PageContainer>
      </div>
    </div>
  );
}
