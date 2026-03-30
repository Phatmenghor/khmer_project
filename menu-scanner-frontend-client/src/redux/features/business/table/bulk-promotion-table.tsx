import { indexDisplay } from "@/utils/common/common";
import { TableColumn } from "@/components/shared/common/data-table";
import { CustomCheckbox } from "@/components/shared/common/custom-checkbox";
import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ProductDetailResponseModel } from "../store/models/response/product-response";

interface BulkPromotionTableOptions {
  selectedProductIds: Map<string, boolean>;
  onSelectProduct: (productId: string) => void;
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
  someSelected: boolean;
  isLoading: boolean;
  pageNo: number;
  pageSize: number;
}

/**
 * ProductImagePreview - Display product image with square rounded styling
 */
function ProductImagePreview({
  product,
}: {
  product: ProductDetailResponseModel;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 transition-all duration-300">
      {!imageError && product?.mainImageUrl ? (
        <>
          {!imageLoaded && (
            <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />
          )}
          <Image
            src={product.mainImageUrl}
            alt={product.name}
            width={48}
            height={48}
            className={cn(
              "w-full h-full object-cover transition-all duration-300 hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </>
      ) : (
        <span className="text-lg font-bold text-primary/80 hover:text-primary transition-colors">
          {product?.name?.charAt(0).toUpperCase() || "P"}
        </span>
      )}
    </div>
  );
}

export const bulkPromotionTableColumns = ({
  selectedProductIds,
  onSelectProduct,
  onSelectAll,
  allSelected,
  someSelected,
  isLoading,
  pageNo,
  pageSize,
}: BulkPromotionTableOptions): TableColumn<ProductDetailResponseModel>[] => {
  return [
    {
      key: "checkbox",
      label: "",
      width: "50px",
      className: "pl-3 pr-1 flex items-center justify-center",
      render: (product) => (
        <CustomCheckbox
          checked={selectedProductIds.has(product.id)}
          onCheckedChange={() => onSelectProduct(product.id)}
          disabled={isLoading}
          size="lg"
          variant="default"
          ariaLabel={`Select ${product.name}`}
        />
      ),
    },
    {
      key: "index",
      label: "#",
      width: "50px",
      className: "px-2 pointer-events-none select-none",
      render: (_, index) => (
        <span className="font-medium text-xs pointer-events-none">
          {indexDisplay(pageNo || 1, pageSize || 10, index + 1)}
        </span>
      ),
    },
    {
      key: "name",
      label: "Product Name",
      className: "px-4",
      render: (product) => (
        <span className="text-xs font-medium truncate max-w-xs">
          {product.name}
        </span>
      ),
    },
    {
      key: "brandName",
      label: "Brand",
      className: "px-4",
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {product.brandName || "---"}
        </span>
      ),
    },
    {
      key: "categoryName",
      label: "Category",
      className: "px-4",
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {product.categoryName || "---"}
        </span>
      ),
    },
    {
      key: "displayPrice",
      label: "Price",
      className: "px-4 text-right",
      render: (product) => (
        <span className="text-xs font-semibold">
          ${(product.displayPrice ?? 0).toFixed(2)}
        </span>
      ),
    },
  ];
};
