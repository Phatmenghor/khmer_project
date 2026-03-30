"use client";

import React, { useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductDetailResponseModel } from "../store/models/response/product-response";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";

interface Props {
  products: ProductDetailResponseModel[];
  selectedProductIds: Set<string>;
  onSelectProduct: (productId: string) => void;
  onSelectAll: (selected: boolean) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export const BulkPromotionProductTable: React.FC<Props> = ({
  products,
  selectedProductIds,
  onSelectProduct,
  onSelectAll,
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}) => {
  const allSelected =
    products.length > 0 && products.every((p) => selectedProductIds.has(p.id));
  const someSelected =
    products.some((p) => selectedProductIds.has(p.id)) && !allSelected;

  const handleSelectAll = useCallback(() => {
    onSelectAll(!allSelected);
  }, [allSelected, onSelectAll]);

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Select Products ({selectedProductIds.size} selected)
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span>
        </div>
      </div>

      {/* Select All Checkbox */}
      <div className="flex items-center gap-3 pb-3 border-b">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onCheckedChange={handleSelectAll}
          disabled={isLoading}
        />
        <label className="text-sm font-medium cursor-pointer">
          Select all products on this page
        </label>
      </div>

      {/* Products List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">No products found</p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Checkbox
                checked={selectedProductIds.has(product.id)}
                onCheckedChange={() => onSelectProduct(product.id)}
                disabled={isLoading}
              />
              <CustomAvatar
                imageUrl={product.mainImageUrl}
                name={product.name}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.categoryName} • ${parseFloat(product.displayPrice?.toString() || "0").toFixed(2)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
