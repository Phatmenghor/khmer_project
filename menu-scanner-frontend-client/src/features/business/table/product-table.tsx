import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { Switch } from "@/components/ui/switch";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { TableImage } from "@/components/shared/table/table-image";
import {
  AllProductResponseModel,
  ProductDetailResponseModel,
} from "../store/models/response/product-response";

interface ProductTableHandlers {
  handleEditProduct: (brand: ProductDetailResponseModel) => void;
  handleProductViewDetail: (brand: ProductDetailResponseModel) => void;
  handleDeleteProduct: (brand: ProductDetailResponseModel) => void;
  handleStatusChange?: (productId: string, status: string) => void;
}

interface ProductTableOptions {
  data: AllProductResponseModel | null;
  handlers: ProductTableHandlers;
}


function SizesDisplay({ sizes }: { sizes: { id: string; name: string; finalPrice: number; hasPromotion?: boolean; promotionType?: string; promotionValue?: number }[] | undefined }) {
  if (!sizes || sizes.length === 0) {
    return <span className="text-xs text-muted-foreground">No sizes</span>;
  }

  return (
    <div className="flex flex-nowrap gap-1 overflow-x-auto pb-1">
      {sizes.map((size) => (
        <div
          key={size.id}
          className="px-1 py-1 rounded bg-gray-50 text-xs text-foreground whitespace-nowrap border-[0.5px] border-primary"
        >
          {size.name} ${parseFloat(size.finalPrice.toString()).toFixed(2)}
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

export const productTableColumns = ({
  data,
  handlers,
}: ProductTableOptions): TableColumn<ProductDetailResponseModel>[] => {
  const {
    handleEditProduct,
    handleProductViewDetail,
    handleDeleteProduct,
    handleStatusChange,
  } = handlers;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "400px",
      render: (_, index) => (
        <span className="text-xs text-muted-foreground">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 15, index + 1)}
        </span>
      ),
    },
    {
      key: "imageUrl",
      label: "Image",
      minWidth: "10px",
      maxWidth: "400px",
      render: (product) => (
        <TableImage
          src={product.mainImage?.sm}
          previewSrc={product.mainImage?.o}
          alt={product?.name}
          fallbackText={product?.name || "P"}
        />
      ),
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
      key: "pricing",
      label: "Price",
      minWidth: "150px",
      maxWidth: "250px",
      render: (product) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            {product?.displayOriginPrice && product.displayOriginPrice !== product.displayPrice && (
              <span className="text-xs text-muted-foreground line-through">
                ${parseFloat(product?.displayOriginPrice?.toString() || "0").toFixed(2)}
              </span>
            )}
            <span className="text-xs font-semibold text-foreground">
              ${parseFloat(product?.displayPrice?.toString() || "0").toFixed(2)}
            </span>
          </div>
          {product?.hasPromotion && (
            <div className="text-xs font-semibold text-red-600">
              {product.displayPromotionType === "PERCENTAGE"
                ? `-${product.displayPromotionValue}%`
                : `-$${product.displayPromotionValue}`}
            </div>
          )}
        </div>
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
        <div className="flex items-center gap-1">
          <Switch
            checked={product?.status === "ACTIVE"}
            onCheckedChange={() => {
              const newStatus = product?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
              handleStatusChange?.(product?.id || "", newStatus);
            }}
          />
          <span className="text-xs text-muted-foreground">
            {product?.status ? formatEnumValue(product.status) : "---"}
          </span>
        </div>
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (banner) => (
        <span className="text-xs text-muted-foreground">
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
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<Eye className="w-3 h-3" />}
            tooltip="View Details"
            onClick={() => handleProductViewDetail(brand)}
          />
          <ActionButton
            icon={<Edit className="w-3 h-3" />}
            tooltip="Edit Product"
            onClick={() => handleEditProduct(brand)}
          />
          <ActionButton
            icon={<Trash className="w-3 h-3" />}
            tooltip="Delete Product"
            onClick={() => handleDeleteProduct(brand)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
