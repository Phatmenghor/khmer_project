import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash, RotateCcw, Zap } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AllProductResponseModel,
  ProductDetailResponseModel,
} from "../store/models/response/product-response";

interface ProductTableHandlers {
  handleEditProduct: (brand: ProductDetailResponseModel) => void;
  handleProductViewDetail: (brand: ProductDetailResponseModel) => void;
  handleDeleteProduct: (brand: ProductDetailResponseModel) => void;
  handleResetPromotion?: (brand: ProductDetailResponseModel) => void;
}

interface ProductPromotionTableOptions {
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
 * StatusDisplay - Display product status with consistent styling
 */
function StatusDisplay({ value }: { value: string }) {
  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "OUT_OF_STOCK", label: "Out Of Stock" },
  ];

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Active";
      case "INACTIVE":
        return "Inactive";
      case "OUT_OF_STOCK":
        return "Out Of Stock";
      default:
        return status;
    }
  };

  return (
    <div className="w-36 h-8 px-3 py-2 rounded-md bg-gray-100 text-gray-700 text-xs flex items-center">
      {getStatusDisplay(value)}
    </div>
  );
}

export const productPromotionTableColumns = ({
  data,
  handlers,
}: ProductPromotionTableOptions): TableColumn<ProductDetailResponseModel>[] => {
  const { handleEditProduct, handleProductViewDetail, handleDeleteProduct, handleResetPromotion } =
    handlers;

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
      key: "displayPromotionType",
      label: "Promo Type",
      minWidth: "10px",
      maxWidth: "120px",
      truncate: true,
      render: (product) => {
        const typeLabel =
          product?.displayPromotionType === "FIXED_AMOUNT"
            ? "Fixed Amount"
            : product?.displayPromotionType === "PERCENTAGE"
              ? "Percentage"
              : "---";

        return (
          <Badge className="gap-1 bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 whitespace-nowrap">
            <Zap className="w-3 h-3" />
            {typeLabel}
          </Badge>
        );
      },
    },

    {
      key: "displayPromotionValue",
      label: "Promo Value",
      minWidth: "10px",
      maxWidth: "120px",
      truncate: true,
      render: (product) => {
        const value = product?.displayPromotionValue;
        const type = product?.displayPromotionType;

        let displayValue = "---";
        if (value) {
          if (type === "PERCENTAGE") {
            displayValue = `${value}%`;
          } else if (type === "FIXED_AMOUNT") {
            displayValue = `$${parseFloat(value.toString()).toFixed(2)}`;
          } else {
            displayValue = value;
          }
        }

        return (
          <span className="text-xs font-semibold text-red-600">
            {displayValue}
          </span>
        );
      },
    },

    {
      key: "displayPromotionFromDate",
      label: "From Date",
      minWidth: "10px",
      maxWidth: "150px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {dateTimeFormat(product?.displayPromotionFromDate) || "---"}
        </span>
      ),
    },

    {
      key: "displayPromotionToDate",
      label: "To Date",
      minWidth: "10px",
      maxWidth: "150px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {dateTimeFormat(product?.displayPromotionToDate) || "---"}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      minWidth: "150px",
      maxWidth: "350px",
      render: (product) => (
        <StatusDisplay value={product?.status || "ACTIVE"} />
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
          {handleResetPromotion && brand?.hasPromotion && (
            <ActionButton
              icon={<RotateCcw className="w-4 h-4" />}
              tooltip="Reset Promotion"
              onClick={() => handleResetPromotion(brand)}
              variant="secondary"
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
