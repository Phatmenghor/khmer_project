"use client";

import { memo } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";

interface SizeCustomizationProps {
  product: ProductDetailResponseModel;
  selectedSizeCustoms: Set<string>;
  onToggleCustomization: (customizationId: string) => void;
}

function SizeCustomizationComponent({
  product,
  selectedSizeCustoms,
  onToggleCustomization,
}: SizeCustomizationProps) {
  if (!product.customizations || product.customizations.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="font-semibold text-sm text-foreground">Add-ons</h4>
        {selectedSizeCustoms.size > 0 && (
          <Badge
            variant="secondary"
            className="text-xs bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
          >
            {selectedSizeCustoms.size} selected
          </Badge>
        )}
      </div>
      <div className="space-y-2">
        {product.customizations.map((customization) => {
          const isSelected = selectedSizeCustoms.has(customization.id);
          const priceAdjustment = customization.priceAdjustment || 0;
          return (
            <button
              key={customization.id}
              onClick={() => onToggleCustomization(customization.id)}
              className={cn(
                "w-full flex items-center justify-between rounded-xl px-3.5 py-3 transition-all duration-200 cursor-pointer text-left border-2",
                isSelected
                  ? "bg-emerald-50 border-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-700"
                  : "border-border hover:border-emerald-300 hover:bg-emerald-50/40 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20",
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
                    isSelected
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-border bg-background",
                  )}
                >
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="font-medium text-sm text-foreground truncate">
                  {customization.name}
                </span>
              </div>
              <span
                className={cn(
                  "text-sm font-semibold shrink-0 ml-2 px-2 py-0.5 rounded-full",
                  isSelected
                    ? "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/40"
                    : "text-muted-foreground bg-muted/60",
                )}
              >
                +{formatCurrency(priceAdjustment)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const SizeCustomization = memo(SizeCustomizationComponent);
