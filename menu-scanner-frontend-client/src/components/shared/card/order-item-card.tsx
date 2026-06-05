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
    <div className="bg-white border border-slate-100 rounded-lg px-2.5 py-2 hover:border-slate-200 hover:shadow-sm transition-all duration-150">
      <div className="flex gap-2">
        {/* Image */}
        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
          <Image
            src={sanitizeImageUrl(item.product?.imageUrl, appImages.NoImage)}
            alt={item.product?.name || "Product"}
            fill
            className="object-cover"
          />
          {item.hasPromotion && (
            <div className="absolute top-0.5 left-0.5 z-10 pointer-events-none">
              <Badge variant="destructive" className="text-[8px] font-bold px-1 py-0 leading-4 shadow-sm">
                {item.promotionType === "PERCENTAGE"
                  ? `-${item.promotionValue}%`
                  : `-${formatCurrency(item.promotionValue ?? 0)}`}
              </Badge>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          {/* Name + qty badge */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="font-semibold text-[11px] leading-tight text-slate-800 line-clamp-1 flex-1">
              {item.product?.name || "Unknown Product"}
            </h3>
            <span className="shrink-0 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5 leading-none">
              x{item.quantity}
            </span>
          </div>

          {/* Size + customization pills */}
          {(item.product?.sizeName || (item.customizations && item.customizations.length > 0)) && (
            <div className="flex flex-wrap gap-1 mb-1">
              {item.product?.sizeName && (
                <span className="text-[9px] font-medium text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-100 whitespace-nowrap leading-none">
                  {item.product.sizeName}
                </span>
              )}
              {item.customizations?.map((c, idx) => (
                <span key={idx} className="text-[9px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 whitespace-nowrap leading-none">
                  {c.name}{c.priceAdjustment > 0 ? ` +${formatCurrency(c.priceAdjustment)}` : ""}
                </span>
              ))}
            </div>
          )}

          {/* Price row */}
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-[11px] text-slate-900">
              {formatCurrency(item.totalPrice)}
            </span>
            <span className="text-[9px] text-slate-400">
              ({formatCurrency(item.finalPrice)} ea)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
