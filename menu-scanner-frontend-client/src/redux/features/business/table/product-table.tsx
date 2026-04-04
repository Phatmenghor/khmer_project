import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash, Package, RotateCcw, Zap, Check } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  AllProductResponseModel,
  ProductDetailResponseModel,
} from "../store/models/response/product-response";

interface ProductTableHandlers {
  handleEditProduct: (brand: ProductDetailResponseModel) => void;
  handleProductViewDetail: (brand: ProductDetailResponseModel) => void;
  handleDeleteProduct: (brand: ProductDetailResponseModel) => void;
  handleResetPromotion?: (product: ProductDetailResponseModel) => void;
  handleStatusChange?: (productId: string, status: string) => void;
}

interface ProductTableOptions {
  data: AllProductResponseModel | null;
  handlers: ProductTableHandlers;
}

/**
 * ProductImagePreview - Display product image with preview styling
 */
function ProductImagePreview({
  product,
}: {
  product: ProductDetailResponseModel;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="relative w-14 h-14 flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 transition-all duration-300">
      {!imageError && product?.mainImageUrl ? (
        <>
          {!imageLoaded && (
            <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />
          )}
          <Image
            src={product.mainImageUrl}
            alt={product.name}
            width={56}
            height={56}
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

/**
 * SizesDisplay - Display product sizes in simple bordered boxes
 */
function SizesDisplay({ sizes }: { sizes: any[] | undefined }) {
  if (!sizes || sizes.length === 0) {
    return <span className="text-xs text-muted-foreground">No sizes</span>;
  }

  return (
    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
      {sizes.map((size) => (
        <div
          key={size.id}
          className="px-2 py-1 rounded bg-gray-50 text-xs text-foreground whitespace-nowrap"
          style={{
            border: "0.5px solid #FCD34D",
          }}
        >
          {size.name} ${size.finalPrice}
          {size.hasPromotion && (
            <span className="text-red-600 font-semibold ml-1">
              {size.promotionType === "FIXED_AMOUNT"
                ? `-$${size.promotionValue}`
                : `-${size.promotionValue}%`}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * StatusSelect - CustomSelect component for status updates
 */
function StatusSelect({
  value,
  onStatusChange,
  productId,
}: {
  value: string;
  onStatusChange?: (productId: string, status: string) => void;
  productId: string;
}) {
  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "OUT_OF_STOCK", label: "Out Of Stock" },
  ];

  return (
    <CustomSelect
      options={statusOptions}
      value={value}
      onValueChange={(newStatus) => onStatusChange?.(productId, newStatus)}
      placeholder="Select status"
      size="sm"
    />
  );
}

export const productTableColumns = ({
  data,
  handlers,
}: ProductTableOptions): TableColumn<ProductDetailResponseModel>[] => {
  const {
    handleEditProduct,
    handleProductViewDetail,
    handleDeleteProduct,
    handleResetPromotion,
    handleStatusChange,
  } = handlers;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "400px",
      render: (_, index) => (
        <span className="font-medium">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 15, index + 1)}
        </span>
      ),
    },
    {
      key: "imageUrl",
      label: "Image",
      minWidth: "10px",
      maxWidth: "400px",
      render: (product) => {
        return <ProductImagePreview product={product} />;
      },
    },

    {
      key: "name",
      label: "Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {product?.name || "---"}
        </span>
      ),
    },

    {
      key: "sku",
      label: "SKU",
      minWidth: "10px",
      maxWidth: "120px",
      truncate: true,
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
      render: (product) => (
        <span className="text-xs text-muted-foreground font-mono">
          {product?.barcode || "---"}
        </span>
      ),
    },

    {
      key: "categoryName",
      label: "Category",
      minWidth: "10px",
      maxWidth: "150px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {product?.categoryName || "---"}
        </span>
      ),
    },

    {
      key: "brandName",
      label: "Brand",
      minWidth: "10px",
      maxWidth: "150px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {product?.brandName || "---"}
        </span>
      ),
    },

    {
      key: "displayPrice",
      label: "Price",
      minWidth: "10px",
      maxWidth: "100px",
      truncate: true,
      render: (product) => (
        <span className="text-xs font-semibold text-foreground">
          ${parseFloat(product?.displayPrice?.toString() || "0").toFixed(2)}
        </span>
      ),
    },

    {
      key: "hasPromotion",
      label: "Promotion",
      minWidth: "10px",
      maxWidth: "100px",
      truncate: true,
      render: (product) => (
        <div className="flex items-center gap-1">
          {product?.hasPromotion ? (
            <span className="gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-semibold inline-block">
              Active
            </span>
          ) : (
            <span className="gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-semibold inline-block">
              Regular
            </span>
          )}
        </div>
      ),
    },

    {
      key: "displayOriginPrice",
      label: "Original Price",
      minWidth: "10px",
      maxWidth: "120px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground line-through">
          $
          {parseFloat(product?.displayOriginPrice?.toString() || "0").toFixed(
            2,
          )}
        </span>
      ),
    },

    {
      key: "sizes",
      label: "Sizes",
      minWidth: "25px",
      maxWidth: "400px",
      render: (product) => <SizesDisplay sizes={product?.sizes} />,
    },

    {
      key: "status",
      label: "Status",
      minWidth: "150px",
      maxWidth: "350px",
      render: (product) => (
        <StatusSelect
          value={product?.status || "ACTIVE"}
          onStatusChange={handleStatusChange}
          productId={product?.id || ""}
        />
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (banner) => (
        <span className="text-sm text-muted-foreground">
          {dateTimeFormat(banner?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (brand) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleProductViewDetail(brand)}
          />
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit Product"
            onClick={() => handleEditProduct(brand)}
          />
          {brand?.hasPromotion && (
            <ActionButton
              icon={<RotateCcw className="w-4 h-4" />}
              tooltip="Reset Promotion"
              onClick={() => handleResetPromotion?.(brand)}
              variant="outline"
            />
          )}
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Product"
            onClick={() => handleDeleteProduct(brand)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
