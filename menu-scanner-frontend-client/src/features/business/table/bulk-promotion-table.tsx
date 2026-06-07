import { indexDisplay } from "@/utils/common/common";
import { TableColumn } from "@/components/shared/common/data-table";
import { CustomCheckbox } from "@/components/shared/common/custom-checkbox";
import { cn } from "@/lib/utils";
import { TableImage } from "@/components/shared/table/table-image";
import { ProductDetailResponseModel } from "../store/models/response/product-response";
import { Badge } from "@/components/ui/badge";
import { Eye, RotateCcw } from "lucide-react";
import { ActionButton } from "@/components/shared/button/action-button";

interface BulkPromotionTableOptions {
  selectedProductIds: Map<string, boolean>;
  onSelectProduct: (productId: string) => void;
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
  someSelected: boolean;
  isLoading: boolean;
  pageNo: number;
  pageSize: number;
  selectedSizes?: Map<string, Set<string>>;
  onSizeToggle?: (productId: string, sizeId: string) => void;
  onViewDetails?: (product: ProductDetailResponseModel) => void;
  onEditProduct?: (product: ProductDetailResponseModel) => void;
  onResetPromotion?: (product: ProductDetailResponseModel) => void;
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
  onViewDetails,
  onEditProduct,
  onResetPromotion,
}: BulkPromotionTableOptions): TableColumn<ProductDetailResponseModel>[] => {
  return [
    {
      key: "index",
      label: "#",
      width: "50px",
      minWidth: "10px",
      maxWidth: "120px",
      className: "pr-1",
      render: (_, index) => (
        <span className="text-xs text-muted-foreground pointer-events-none">
          {indexDisplay(pageNo || 1, pageSize || 10, index + 1)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "120px",
      className: "px-1",
      render: (product) => (
        <div className="flex items-center gap-1">
          <CustomCheckbox
            checked={selectedProductIds.has(product.id)}
            onCheckedChange={() => onSelectProduct(product.id)}
            disabled={isLoading}
            size="lg"
            variant="default"
            ariaLabel={`Select ${product.name}`}
          />

          <ActionButton
            icon={<Eye className="w-3 h-3" />}
            tooltip="View Details"
            onClick={() => onViewDetails?.(product)}
          />
          {product?.hasPromotion && (
            <ActionButton
              icon={<RotateCcw className="w-3 h-3" />}
              tooltip="Reset Promotion"
              onClick={() => onResetPromotion?.(product)}
            />
          )}
        </div>
      ),
    },

    {
      key: "image",
      label: "Image",
      width: "60px",
      minWidth: "10px",
      maxWidth: "120px",
      className: "px-1",
      render: (product) => (
        <TableImage src={product.mainImage?.sm} previewSrc={product.mainImage?.o} alt={product.name} fallbackText={product.name} />
      ),
    },
    {
      key: "name",
      label: "Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      className: "px-3",
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {product?.name || "---"}
        </span>
      ),
    },

    {
      key: "pricing",
      label: "Price",
      minWidth: "100px",
      maxWidth: "200px",
      className: "px-3",
      render: (product) => {
        return (
          <div className="space-y-1">
            <span className="text-xs font-semibold text-foreground">
              ${Number(product.displayPrice || 0).toFixed(2)}
            </span>
            {product.displayOriginPrice &&
              product.displayPrice <
                Number(product.displayOriginPrice || 0) && (
                <div className="text-xs text-muted-foreground line-through">
                  ${Number(product.displayOriginPrice).toFixed(2)}
                </div>
              )}
          </div>
        );
      },
    },
    {
      key: "sizes",
      label: "Sizes",
      minWidth: "10px",
      maxWidth: "400px",
      className: "px-3",
      render: (product) => {
        if (!product.hasSizes || !product.sizes || product.sizes.length === 0) {
          return <span className="text-xs text-muted-foreground">- - -</span>;
        }

        return (
          <div className="flex flex-row gap-1 items-center flex-nowrap overflow-x-auto pb-1">
            {product.sizes.map((size) => {
              const isSelected =
                selectedSizes.get(product.id)?.has(size.id) || false;
              const hasPromotion = size.promotionType && size.promotionValue;

              return (
                <label
                  key={size.id}
                  className={cn(
                    "flex items-center gap-1 px-1 py-1 rounded border text-xs transition-all duration-150 cursor-pointer group whitespace-nowrap flex-shrink-0",
                    isSelected
                      ? "bg-primary/15 border-primary/50 hover:bg-primary/20 hover:border-primary/70 shadow-sm"
                      : "bg-white border-border/50 hover:bg-gray-50 hover:border-border/70",
                  )}
                >
                  {}
                  <CustomCheckbox
                    checked={isSelected}
                    onCheckedChange={() => onSizeToggle?.(product.id, size.id)}
                    size="sm"
                    variant="default"
                    ariaLabel={`Select ${size.name}`}
                  />

                  {}
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {size.name}
                  </span>

                  {}
                  {hasPromotion && (
                    <span className="bg-red-100/70 text-red-700 text-xs h-fit px-1 py-0.5 rounded inline-block font-semibold">
                      {size.promotionType === "PERCENTAGE"
                        ? `${size.promotionValue}%`
                        : `$${size.promotionValue}`}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        );
      },
    },

    {
      key: "sku",
      label: "SKU",
      minWidth: "10px",
      maxWidth: "120px",
      truncate: true,
      className: "px-3",
      render: (product) => (
        <span className="text-xs text-muted-foreground font-mono">
          {product?.sku || "---"}
        </span>
      ),
    },

    {
      key: "barcode",
      label: "Barcode",
      minWidth: "10px",
      maxWidth: "120px",
      truncate: true,
      className: "px-3",
      render: (product) => (
        <span className="text-xs text-muted-foreground font-mono">
          {product?.barcode || "---"}
        </span>
      ),
    },
  ];
};
