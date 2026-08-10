"use client";

import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/shared/image/smart-image";
import { formatCurrency } from "@/utils/common/currency-format";
import { getPromotionBadgeText } from "@/utils/common/promotion-format";
import { OrderItemResponse } from "@/features/main/store/models/response/order-response";
import { getProductImageUrl } from "@/utils/common/common";

interface OrderItemCardProps {
  item: OrderItemResponse;
}

export function OrderItemCard({ item }: OrderItemCardProps) {
  return (
    <div className="bg-card border border-border/80 rounded-[10px] p-3 hover:border-primary/40 hover:shadow-xs transition-all duration-200">
      <div className="flex gap-3">
        {/* Image */}
        <div className="relative w-[76px] h-[76px] rounded-[8px] overflow-hidden bg-muted border border-border/70 flex-shrink-0 shadow-2xs">
          <SmartImage
            src={getProductImageUrl(item.product?.imageUrl)}
            alt={item.product?.name || "Product"}
            fill
          />
          {item.hasPromotion && (item.promotionValue ?? 0) > 0 && (
            <div className="absolute top-1 left-1 z-10 pointer-events-none">
              <Badge variant="destructive" className="text-[9px] font-black px-1 py-0.5 shadow-xs">
                {getPromotionBadgeText(
                  item.hasPromotion,
                  item.promotionType,
                  item.promotionValue
                )}
              </Badge>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between pr-1">
          <h3 className="font-extrabold text-xs leading-tight text-foreground truncate mb-1">
            {item.product?.name || item.productName || "Unknown Product"}
          </h3>

          {/* Size + Customization Pills */}
          {(item.product?.sizeName || item.sizeName || (item.customizations && item.customizations.length > 0)) && (
            <div className="flex flex-wrap gap-1 mb-1">
              {(item.product?.sizeName || item.sizeName) && (item.product?.sizeName !== "Standard" && item.sizeName !== "Standard") && (
                <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-1.5 py-0.2 rounded-full border border-primary/30 whitespace-nowrap">
                  {item.product?.sizeName || item.sizeName}
                </span>
              )}
              {item.customizations?.map((c, idx) => (
                <span key={idx} className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/20 whitespace-nowrap">
                  + {c.name} {c.priceAdjustment > 0 ? `(+${formatCurrency(c.priceAdjustment)})` : ""}
                </span>
              ))}
            </div>
          )}

          {/* Price + Qty */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
            <div className="flex items-baseline gap-1">
              <span className="font-black text-xs text-foreground">
                {formatCurrency(item.finalPrice)}
              </span>
              {item.hasPromotion && item.currentPrice && item.currentPrice > item.finalPrice && (
                <span className="text-[9px] text-muted-foreground line-through font-semibold">
                  {formatCurrency(item.currentPrice)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black text-primary bg-primary/10 border border-primary/20 rounded-[6px] px-1.5 py-0.5 leading-none">
                x{item.quantity}
              </span>
              <span className="font-black text-xs text-foreground">{formatCurrency(item.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
