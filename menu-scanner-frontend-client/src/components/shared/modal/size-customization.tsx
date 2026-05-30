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
            className="text-xs bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800"
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
                "w-full flex items-center justify-between rounded-lg px-3 py-2.5 transition-all duration-200 cursor-pointer text-left border",
                isSelected
                  ? "bg-yellow-50 border-yellow-400 dark:bg-yellow-950/30 dark:border-yellow-700"
                  : "border-border hover:border-yellow-300 hover:bg-yellow-50/50 dark:hover:border-yellow-700 dark:hover:bg-yellow-950/20",
              )}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
                    isSelected
                      ? "border-yellow-500 bg-yellow-500"
                      : "border-border bg-background",
                  )}
                >
                  {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                </div>
                <span className="font-medium text-xs text-foreground truncate">
                  {customization.name}
                </span>
              </div>
              <span
                className={cn(
                  "text-xs font-semibold shrink-0 ml-2 px-1.5 py-0.5 rounded-full",
                  isSelected
                    ? "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-950/40"
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
