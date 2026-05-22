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
        <h4 className="font-semibold text-sm text-green-600">Add-ons</h4>
        {selectedSizeCustoms.size > 0 && (
          <Badge
            variant="secondary"
            className="text-xs bg-green-100 text-green-700 border-green-300"
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
                "w-full flex items-center justify-between rounded-lg px-3 py-2.5 transition-all cursor-pointer text-left border",
                isSelected
                  ? "bg-green-50 border-green-300"
                  : "border-border hover:border-green-300 hover:bg-green-50/30"
              )}
            >
              <div className="flex-1">
                <div className="font-semibold text-sm text-foreground">
                  {customization.name}
                </div>
              </div>
              <div className="flex items-center gap-3 ml-2">
                <span className="text-sm font-semibold text-green-600">
                  +{formatCurrency(priceAdjustment)}
                </span>
                {isSelected && (
                  <div className="bg-green-500 text-white rounded-full p-0.5 flex-shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const SizeCustomization = memo(SizeCustomizationComponent);
