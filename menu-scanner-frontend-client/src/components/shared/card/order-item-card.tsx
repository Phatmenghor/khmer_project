"use client";

import Image from "next/image";
import { formatCurrency } from "@/utils/common/currency-format";
import { sanitizeImageUrl } from "@/utils/common/common";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { OrderItemResponse } from "@/features/main/store/models/response/order-response";

interface OrderItemCardProps {
  item: OrderItemResponse;
}

export function OrderItemCard({ item }: OrderItemCardProps) {
  return (
    <div className="flex gap-2 py-1.5 border-b border-slate-100 last:border-0">
      {/* Image */}
      <div className="relative w-9 h-9 rounded overflow-hidden bg-slate-50 flex-shrink-0">
        <Image
          src={sanitizeImageUrl(item.product?.imageUrl, appImages.NoImage)}
          alt={item.product?.name || "Product"}
          fill
          className="object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        {/* Name + qty */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-800 line-clamp-1 flex-1">
            {item.product?.name || "Unknown Product"}
          </span>
          <span className="text-[10px] font-bold text-primary shrink-0">x{item.quantity}</span>
        </div>

        {/* Size + customizations */}
        {(item.product?.sizeName || (item.customizations && item.customizations.length > 0)) && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {item.product?.sizeName && (
              <span className="text-[9px] text-violet-600 bg-violet-50 px-1 rounded border border-violet-100 leading-4">
                {item.product.sizeName}
              </span>
            )}
            {item.customizations?.map((c, idx) => (
              <span key={idx} className="text-[9px] text-slate-400 bg-slate-50 px-1 rounded border border-slate-100 leading-4">
                {c.name}{c.priceAdjustment > 0 ? ` +${formatCurrency(c.priceAdjustment)}` : ""}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-[11px] font-bold text-slate-900">{formatCurrency(item.totalPrice)}</span>
          <span className="text-[9px] text-slate-400">({formatCurrency(item.finalPrice)} ea)</span>
        </div>
      </div>
    </div>
  );
}
