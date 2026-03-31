import { indexDisplay } from "@/utils/common/common";
import { TableColumn } from "@/components/shared/common/data-table";
import { CustomCheckbox } from "@/components/shared/common/custom-checkbox";
import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ProductDetailResponseModel } from "../store/models/response/product-response";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Check } from "lucide-react";

interface BulkPromotionTableOptions {
  selectedProductIds: Map<string, boolean>;
  onSelectProduct: (productId: string) => void;
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
  someSelected: boolean;
  isLoading: boolean;
  pageNo: number;
  pageSize: number;
  selectedSizes?: Map<string, Set<string>>; // productId -> sizeIds
  onSizeToggle?: (productId: string, sizeId: string) => void;
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
              imageLoaded ? "opacity-100" : "opacity-0",
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
  selectedSizes = new Map(),
  onSizeToggle,
}: BulkPromotionTableOptions): TableColumn<ProductDetailResponseModel>[] => {
  return [
    {
      key: "checkbox",
      label: "",
      width: "50px",
      className: "pl-4",
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
      className: "pr-2",
      render: (_, index) => (
        <span className="font-medium text-xs pointer-events-none">
          {indexDisplay(pageNo || 1, pageSize || 10, index + 1)}
        </span>
      ),
    },
    {
      key: "image",
      label: "Image",
      width: "60px",
      className: "px-2",
      render: (product) => <ProductImagePreview product={product} />,
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
    {
      key: "sizes",
      label: "Available Sizes",
      className: "px-4",
      render: (product) => {
        if (!product.hasSizes || !product.sizes || product.sizes.length === 0) {
          return <span className="text-xs text-muted-foreground">No sizes</span>;
        }

        const selectedCount = selectedSizes.get(product.id)?.size || 0;
        // Default to expanded when product has sizes
        const [expanded, setExpanded] = useState(true);

        return (
          <div className="flex flex-col gap-2 w-full">
            {/* Collapse/Expand Toggle */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-xs font-medium hover:text-primary transition-colors w-fit"
            >
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-transform duration-200",
                  expanded && "rotate-180"
                )}
              />
              <span className="text-muted-foreground">
                {selectedCount}/{product.sizes.length} selected
              </span>
            </button>

            {/* Horizontal Size List - Shown by Default */}
            {expanded && (
              <div className="flex flex-wrap gap-2 w-full">
                {product.sizes.map((size) => {
                  const isSelected = selectedSizes.get(product.id)?.has(size.id) || false;
                  const hasPromotion = size.promotionType && size.promotionValue;

                  return (
                    <label
                      key={size.id}
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs transition-all duration-150 cursor-pointer group whitespace-nowrap",
                        isSelected
                          ? "bg-primary/15 border-primary/50 hover:bg-primary/20 hover:border-primary/70 shadow-sm"
                          : "bg-white border-border/50 hover:bg-gray-50 hover:border-border/70"
                      )}
                    >
                      {/* Custom Checkbox */}
                      <CustomCheckbox
                        checked={isSelected}
                        onCheckedChange={() => onSizeToggle?.(product.id, size.id)}
                        size="sm"
                        variant="default"
                        ariaLabel={`Select ${size.name}`}
                      />

                      {/* Size Name */}
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {size.name}
                      </span>

                      {/* Size Promotion Status Badge */}
                      {hasPromotion && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100/70 text-green-700 border-green-300/40 text-xs h-fit"
                        >
                          <Check className="w-2.5 h-2.5" />
                          {size.promotionType === "PERCENTAGE"
                            ? `${size.promotionValue}%`
                            : `$${size.promotionValue}`}
                        </Badge>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "promotionStatus",
      label: "Promotion Status",
      className: "px-4",
      render: (product) => {
        if (!product.hasActivePromotion) {
          return (
            <Badge variant="outline" className="bg-muted/50">
              No Promotion
            </Badge>
          );
        }

        return (
          <div className="flex flex-col gap-1">
            <Badge variant="default" className="bg-green-500/20 text-green-700 border-green-500/50">
              Active
            </Badge>
            <span className="text-xs text-muted-foreground">
              {product.displayPromotionType === "PERCENTAGE"
                ? `${product.displayPromotionValue}%`
                : `$${product.displayPromotionValue}`}
            </span>
          </div>
        );
      },
    },
    {
      key: "promotionDates",
      label: "Promotion Period",
      className: "px-4",
      render: (product) => {
        if (!product.hasActivePromotion) {
          return <span className="text-xs text-muted-foreground">---</span>;
        }

        const fromDate = product.displayPromotionFromDate
          ? new Date(product.displayPromotionFromDate).toLocaleDateString()
          : "N/A";
        const toDate = product.displayPromotionToDate
          ? new Date(product.displayPromotionToDate).toLocaleDateString()
          : "N/A";

        return (
          <div className="text-xs text-muted-foreground">
            <div>{fromDate}</div>
            <div>to</div>
            <div>{toDate}</div>
          </div>
        );
      },
    },
  ];
};
