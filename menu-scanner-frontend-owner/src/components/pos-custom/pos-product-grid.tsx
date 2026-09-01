"use client";

import React from "react";
import { ChevronRight, Loader2, Package } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductCardSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { POSProductCard } from "@/components/shared/card/pos-product-card";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";
import { useAppDispatch } from "@/store";
import {
  setProducts,
  setProductsLoading,
} from "@/features/business/store/slice/pos-page-slice";
import { fetchPOSPageProductsService } from "@/features/business/store/thunks/pos-page-thunks";

interface POSProductGridProps {
  products: ProductDetailResponseModel[];
  productsLoading: boolean;
  productsError: string | null;
  hasMoreProducts: boolean;
  skeletonCount: number;
  showScrollToTop: boolean;
  debouncedSearch: string;
  selectedCategoryId?: string;
  selectedBrandId?: string;
  promotionFilter?: boolean;
  productGridRef: React.RefObject<HTMLDivElement> | ((node: HTMLDivElement | null) => void);
  observerTarget: React.RefObject<HTMLDivElement> | ((node: HTMLDivElement | null) => void);
  handleProductClick: (product: ProductDetailResponseModel) => void;
  updateQuantity: (productId: string, delta: number) => void;
  scrollProductsToTop: () => void;
}

export function POSProductGrid({
  products,
  productsLoading,
  productsError,
  hasMoreProducts,
  skeletonCount,
  showScrollToTop,
  debouncedSearch,
  selectedCategoryId,
  selectedBrandId,
  promotionFilter,
  productGridRef,
  observerTarget,
  handleProductClick,
  updateQuantity,
  scrollProductsToTop,
}: POSProductGridProps) {
  const dispatch = useAppDispatch();

  return (
    <ScrollArea className="flex-1 w-full overflow-y-auto" ref={productGridRef as any}>
      <div
        className="w-full p-3 sm:p-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))",
          gap: "0.875rem",
        }}
      >
        {productsLoading &&
          products.length === 0 &&
          Array.from({ length: 12 }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-initial-${i}`} />
          ))}

        {products.map((product, index) => (
          <POSProductCard
            key={`${product.id}-${index}`}
            product={product}
            onAddClick={handleProductClick}
            onQuantityChange={updateQuantity}
          />
        ))}

        {hasMoreProducts &&
          Array.from({ length: skeletonCount }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-pagination-${i}`} />
          ))}

        {hasMoreProducts && (
          <div className="col-span-full flex flex-col items-center justify-center py-5">
            <Loader2 className="h-4 w-4 animate-spin text-primary mb-1" />
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
              Loading more products...
            </p>
          </div>
        )}
      </div>

      {hasMoreProducts && !productsLoading && (
        <div ref={observerTarget as any} className="h-1" />
      )}

      {!productsLoading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          {productsError ? (
            <>
              <Package className="w-12 h-12 mb-3 opacity-20 text-destructive" />
              <p className="text-sm sm:text-base font-bold text-destructive">
                Failed to load products
              </p>
              <p className="text-xs sm:text-sm mt-1 max-w-xs text-center font-medium">
                {productsError}
              </p>
              <CustomButton
                variant="outline"
                size="sm"
                className="mt-3 text-xs sm:text-sm font-semibold"
                onClick={() => {
                  dispatch(setProducts([]));
                  dispatch(setProductsLoading(true));
                  dispatch(
                    fetchPOSPageProductsService({
                      page: 1,
                      search: debouncedSearch,
                      categoryId: selectedCategoryId,
                      brandId: selectedBrandId,
                      hasPromotion: promotionFilter,
                      reset: true,
                    })
                  );
                }}
              >
                Retry
              </CustomButton>
            </>
          ) : (
            <>
              <Package className="w-12 h-12 mb-3 opacity-25" />
              <p className="text-sm sm:text-base font-bold">No products found</p>
              <p className="text-xs sm:text-sm mt-1 text-muted-foreground font-medium">
                Try adjusting your search query or selected category filter
              </p>
            </>
          )}
        </div>
      )}

      {/* Scroll to Top Floating Button */}
      {showScrollToTop && (
        <CustomButton
          variant="outline"
          size="icon"
          className="absolute bottom-4 right-4 h-9.5 w-9.5 rounded-full border border-primary/40 shadow-lg bg-background hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          onClick={scrollProductsToTop}
          title="Scroll to top"
        >
          <ChevronRight className="h-5 w-5 transform -rotate-90" />
        </CustomButton>
      )}
    </ScrollArea>
  );
}
