"use client";

import { CustomButton } from "@/components/shared/button/custom-button";
import { memo } from "react";
import { Check, Package } from "lucide-react";
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
      <div className="flex items-center gap-1.5 mb-2">
        <h4 className="font-semibold text-xs text-foreground">Add-ons</h4>
        {selectedSizeCustoms.size > 0 && (
          <Badge
            variant="secondary"
            className="text-[10px] font-bold bg-primary/10 text-primary border-primary/30 py-0 px-2 rounded-full"
          >
            {selectedSizeCustoms.size} selected
          </Badge>
        )}
      </div>
      <div className="space-y-1.5">
        {product.customizations.map((customization) => {
          const isSelected = selectedSizeCustoms.has(customization.id);
          const priceAdjustment = customization.priceAdjustment || 0;
          return (
            <CustomButton variant="unstyled" size="unstyled"
              key={customization.id}
              onClick={() => onToggleCustomization(customization.id)}
              className={cn(
                "w-full flex items-center justify-between rounded-lg px-3 py-2 transition-all duration-200 cursor-pointer text-left border shadow-2xs hover:shadow-xs hover:scale-[1.005]",
                isSelected
                  ? "bg-primary/5 border-primary shadow-xs ring-0.5 ring-primary/20"
                  : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/10",
              )}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all duration-200 shadow-3xs",
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-background",
                  )}
                >
                  {isSelected && <Check className="h-2.5 w-2.5 stroke-[3px] text-white" />}
                </div>
                <Package className={cn("h-3.5 w-3.5 shrink-0 transition-colors duration-200", isSelected ? "text-primary" : "text-muted-foreground/60")} />
                <span className="font-semibold text-xs text-foreground truncate">
                  {customization.name}
                </span>
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold shrink-0 ml-2 px-2 py-0.5 rounded-full border transition-all duration-200",
                  isSelected
                    ? "text-primary bg-primary/10 border-primary/20"
                    : "text-muted-foreground bg-muted/40 border-border/40",
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
