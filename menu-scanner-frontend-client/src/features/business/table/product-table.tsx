import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/custom-button";
import { Switch } from "@/components/ui/switch";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { TableImage } from "@/components/shared/table/table-image";
import { Badge } from "@/components/ui/badge";
import { isPromotionActive, isPromotionScheduled } from "@/constants/status/status";
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


function SizesDisplay({ sizes }: { sizes: { id: string; name: string; finalPrice: number; hasPromotion?: boolean | string; promotionType?: string; promotionValue?: number }[] | undefined }) {
  if (!sizes || sizes.length === 0) {
    return <span className="text-xs text-muted-foreground">No sizes</span>;
  }

  return (
    <div className="flex flex-nowrap gap-1 overflow-x-auto pb-1">
      {sizes.map((size) => {
        const isActive = isPromotionActive(size.hasPromotion);
        const isScheduled = isPromotionScheduled(size.hasPromotion);
        const hasPromoValue = size.promotionValue != null && Number(size.promotionValue) > 0;
        const promoText = size.promotionType === "FIXED_AMOUNT" || size.promotionType === "FIXED"
          ? `-$${size.promotionValue}`
          : `-${size.promotionValue}%`;

        return (
          <div
            key={size.id}
            className="px-1 py-1 rounded bg-gray-50 text-xs text-foreground whitespace-nowrap border-[0.5px] border-primary flex items-center gap-1"
          >
            <span>{size.name} ${parseFloat(size.finalPrice.toString()).toFixed(2)}</span>
            {isActive && hasPromoValue && (
              <span className="text-red-600 font-semibold">
                {promoText} (Active)
              </span>
            )}
            {isScheduled && hasPromoValue && (
              <span className="text-yellow-600 font-semibold">
                {promoText} (Future)
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PricingDisplay({ product }: { product: ProductDetailResponseModel }) {
  const isDiff = Boolean(product?.displayOriginPrice && product.displayOriginPrice !== product.displayPrice);
  const isActive = isPromotionActive(product?.hasPromotion);
  const isScheduled = isPromotionScheduled(product?.hasPromotion);
  
  const promoValue = product?.displayPromotionValue ?? product?.promotionValue;
  const promoType = product?.displayPromotionType ?? product?.promotionType;
  const hasPromoValue = promoValue != null && Number(promoValue) > 0;

  const promoValueText = promoType === "PERCENTAGE"
    ? `-${promoValue}%`
    : `-$${promoValue}`;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 flex-wrap whitespace-nowrap">
        {isDiff && (
          <span className="text-xs text-muted-foreground line-through whitespace-nowrap">
            ${parseFloat(product.displayOriginPrice.toString()).toFixed(2)}
          </span>
        )}
        <span className="text-xs font-semibold text-foreground whitespace-nowrap">
          ${parseFloat((product?.displayPrice ?? 0).toString()).toFixed(2)}
        </span>
      </div>

      {isActive && hasPromoValue && (
        <div className="text-xs font-semibold text-red-600 whitespace-nowrap">
          {promoValueText} (Active)
        </div>
      )}

      {isScheduled && hasPromoValue && (
        <div className="text-xs font-semibold text-yellow-600 whitespace-nowrap">
          {promoValueText} (Future)
        </div>
      )}
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
      minWidth: "180px",
      maxWidth: "350px",
      render: (product) => <PricingDisplay product={product} />,
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
      width: "110px",
      minWidth: "110px",
      maxWidth: "130px",
      isPinnedRight: true,
      render: (product) => (
        <div className="flex items-center justify-center gap-1.5">
          <ActionButton
            icon={<Eye className="w-3.5 h-3.5 text-primary" />}
            tooltip="View Details"
            onClick={() => handleProductViewDetail(product)}
          />
          <ActionButton
            icon={<Edit className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
            tooltip="Edit Product"
            onClick={() => handleEditProduct(product)}
          />
          <ActionButton
            icon={<Trash className="w-3.5 h-3.5" />}
            tooltip="Delete Product"
            onClick={() => handleDeleteProduct(product)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
