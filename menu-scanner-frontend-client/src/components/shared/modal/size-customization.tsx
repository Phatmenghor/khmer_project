"use client";

import { CustomButton } from "@/components/shared/button/custom-button";
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
    <div className="mb-3">
      <div className="flex items-center gap-1 mb-2">
        <h4 className="font-semibold text-xs text-foreground">Add-ons</h4>
        {selectedSizeCustoms.size > 0 && (
          <Badge
            variant="secondary"
            className="text-xs bg-primary/10 text-primary border-primary/30"
          >
            {selectedSizeCustoms.size} selected
          </Badge>
        )}
      </div>
      <div className="space-y-1">
        {product.customizations.map((customization) => {
          const isSelected = selectedSizeCustoms.has(customization.id);
          const priceAdjustment = customization.priceAdjustment || 0;
          return (
            <CustomButton variant="unstyled" size="unstyled"
              key={customization.id}
              onClick={() => onToggleCustomization(customization.id)}
              className={cn(
                "w-full flex items-center justify-between rounded px-2 py-1 transition-all duration-200 cursor-pointer text-left border",
                isSelected
                  ? "bg-primary/5 border-primary"
                  : "border-border hover:border-primary/40 hover:bg-primary/5",
              )}
            >
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-border bg-background",
                  )}
                >
                  {isSelected && <Check className="h-1 w-1 text-white" />}
                </div>
                <span className="font-medium text-xs text-foreground truncate">
                  {customization.name}
                </span>
              </div>
              <span
                className={cn(
                  "text-xs font-semibold shrink-0 ml-1 px-1 py-0.5 rounded-full",
                  isSelected
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground bg-muted/60",
                )}
              >
                +{formatCurrency(priceAdjustment)}
              </span>
            </CustomButton>
          );
        })}
      </div>
    </div>
  );
}

export const SizeCustomization = memo(SizeCustomizationComponent);
