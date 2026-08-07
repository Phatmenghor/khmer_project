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


function SizesDisplay({ sizes }: { sizes: { id: string; name: string; price?: number; finalPrice: number; hasPromotion?: boolean | string; promotionType?: string; promotionValue?: number }[] | undefined }) {
  if (!sizes || sizes.length === 0) {
    return <span className="text-xs text-muted-foreground">No sizes</span>;
  }

  return (
    <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1 max-w-[320px]">
      {sizes.map((size) => {
        const isActive = isPromotionActive(size.hasPromotion);
        const isScheduled = isPromotionScheduled(size.hasPromotion);
        const hasPromoValue = size.promotionValue != null && Number(size.promotionValue) > 0;
        
        const originalPrice = size.price != null ? Number(size.price) : Number(size.finalPrice);
        const displayFinalPrice = Number(size.finalPrice);
        const isDiff = Boolean(isActive && originalPrice !== displayFinalPrice);

        const promoText = size.promotionType === "FIXED_AMOUNT"
          ? `-$${size.promotionValue}`
          : `-${size.promotionValue}%`;

        return (
          <div
            key={size.id}
            className="px-2.5 py-1.5 rounded-lg bg-muted/40 text-xs text-foreground whitespace-nowrap border border-border flex flex-col items-start gap-1 shadow-sm min-w-[80px] hover:border-primary/20 transition-all duration-200"
          >
            <div className="flex items-center gap-1.5 w-full justify-between">
              <span className="font-bold text-[9px] text-muted-foreground/90 uppercase tracking-wider">{size.name}</span>
              {isActive && hasPromoValue && (
                <span className="text-[8px] text-red-600 font-bold bg-red-50/60 dark:bg-red-950/30 px-1 rounded-full border border-red-200">
                  {promoText} Active
                </span>
              )}
              {isScheduled && hasPromoValue && (
                <span className="text-[8px] text-amber-600 font-bold bg-amber-50/60 dark:bg-amber-950/30 px-1 rounded-full border border-amber-200">
                  {promoText} Future
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {isDiff && (
                <span className="text-[10px] text-muted-foreground line-through font-normal">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
              <span className={`text-[10px] font-bold ${isDiff ? (isScheduled ? "text-amber-600 font-extrabold" : "text-red-600 font-extrabold") : "text-foreground"}`}>
                ${displayFinalPrice.toFixed(2)}
              </span>
            </div>
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
