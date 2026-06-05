"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/common/currency-format";
import { sanitizeImageUrl } from "@/utils/common/common";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { OrderItemResponse } from "@/features/main/store/models/response/order-response";

interface OrderItemCardProps {
  item: OrderItemResponse;
}

export function OrderItemCard({ item }: OrderItemCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded p-3 hover:shadow-md transition-all duration-200">
      <div className="flex gap-3">
        {/* Image */}
        <div className="relative w-[80px] h-[80px] rounded overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex-shrink-0 shadow-sm">
          <Image
            src={sanitizeImageUrl(item.product?.imageUrl, appImages.NoImage)}
            alt={item.product?.name || "Product"}
            fill
            className="object-cover"
          />
          {item.hasPromotion && (
            <div className="absolute top-1 left-1 z-10 pointer-events-none">
              <Badge variant="destructive" className="text-[9px] font-bold px-1 py-0.5 shadow-md">
                {item.promotionType === "PERCENTAGE"
                  ? `-${item.promotionValue}%`
                  : `-${formatCurrency(item.promotionValue ?? 0)}`}
              </Badge>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between pr-1">
          <h3 className="font-semibold text-xs leading-tight text-slate-900 line-clamp-1 mb-1">
            {item.product?.name || "Unknown Product"}
          </h3>

          {/* Size + customization pills */}
          {(item.product?.sizeName || (item.customizations && item.customizations.length > 0)) && (
            <div className="flex flex-wrap gap-1 mb-1">
              {item.product?.sizeName && (
                <span className="text-xs font-medium text-primary bg-primary/5 px-1 py-1 rounded-full border border-primary/30 whitespace-nowrap">
                  {item.product.sizeName}
                </span>
              )}
              {item.customizations?.map((c, idx) => (
                <span key={idx} className="text-xs font-medium text-muted-foreground bg-muted px-1 py-1 rounded-full border border-border whitespace-nowrap">
                  {c.name}{c.priceAdjustment > 0 ? ` +${formatCurrency(c.priceAdjustment)}` : ""}
                </span>
              ))}
            </div>
          )}

          {/* Price + qty */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-xs text-slate-900">
                {formatCurrency(item.finalPrice)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5 leading-none">
                x{item.quantity}
              </span>
              <span className="font-bold text-xs text-slate-900">{formatCurrency(item.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
