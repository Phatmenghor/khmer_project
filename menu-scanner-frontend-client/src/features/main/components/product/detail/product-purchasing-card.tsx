"use client";

import { cn } from "@/lib/utils";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Minus, ShoppingCart, AlertTriangle, Layers, Sliders, ShoppingBag } from "lucide-react";
import {
  ProductDetailResponseModel,
  ProductSize,
} from "@/features/business/store/models/response/product-response";
import { ProductCustomizationDto } from "@/features/business/store/models/response/product-customization-response";

interface ProductPurchasingCardProps {
  product: ProductDetailResponseModel;
  hasSizes: boolean;
  hasCustomizations: boolean;
  selectedSize: ProductSize | null;
  onSelectSize: (size: ProductSize) => void;
  selectedCustomizations: ProductCustomizationDto[];
  onToggleCustomization: (customization: ProductCustomizationDto) => void;
  pageQuantity: number;
  onIncrementQuantity: () => void;
  onDecrementQuantity: () => void;
  availableUnits: number;
  isOutOfStock: boolean;
  isAddingToCart: boolean;
  onAddToCart: () => void;
  displayPrice: number;
  customizationExtraCost: number;
}

export function ProductPurchasingCard({
  product,
  hasSizes,
  hasCustomizations,
  selectedSize,
  onSelectSize,
  selectedCustomizations,
  onToggleCustomization,
  pageQuantity,
  onIncrementQuantity,
  onDecrementQuantity,
  availableUnits,
  isOutOfStock,
  isAddingToCart,
  onAddToCart,
  displayPrice,
  customizationExtraCost,
}: ProductPurchasingCardProps) {
  const totalPrice = (displayPrice + customizationExtraCost) * pageQuantity;
  const isLowStock = availableUnits > 0 && availableUnits <= 5;

  return (
    <div className="bg-muted/20 border border-border/60 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3">
      {/* ── STEP 1: Select Size (if available) ── */}
      {hasSizes && product.sizes && product.sizes.length > 0 && (
        <div className="space-y-2 pb-2.5 border-b border-border/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3 w-3 text-primary" />
              1. Select Size
            </span>
            {selectedSize && (
              <span className="text-[11px] font-semibold text-primary">
                Selected: {selectedSize.name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {product.sizes.map((size) => {
              const isSelected = selectedSize?.id === size.id;
              return (
                <CustomButton
                  key={size.id}
                  variant="unstyled"
                  size="unstyled"
                  onClick={() => onSelectSize(size)}
                  className={cn(
                    "flex flex-col items-start justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden",
                    isSelected
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30 shadow-2xs"
                      : "border-border/60 bg-card hover:bg-muted/50 hover:border-primary/40",
                  )}
                >
                  <span className="text-[11px] font-bold text-foreground truncate w-full">
                    {size.name}
                  </span>

                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xs font-bold text-primary">
                      ${size.finalPrice.toFixed(2)}
                    </span>
                    {size.hasPromotion && size.price > size.finalPrice && (
                      <span className="text-[9px] text-muted-foreground line-through">
                        ${size.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </CustomButton>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP 2: Customize & Add-ons (if available) ── */}
      {hasCustomizations && product.customizations && product.customizations.length > 0 && (
        <div className="space-y-2 pb-2.5 border-b border-border/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sliders className="h-3 w-3 text-primary" />
              {hasSizes ? "2. Customize & Add-ons" : "1. Customize & Add-ons"}
            </span>
            {selectedCustomizations.length > 0 && (
              <span className="text-[11px] font-semibold text-primary">
                {selectedCustomizations.length} selected (+${customizationExtraCost.toFixed(2)})
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {product.customizations.map((cust) => {
              const isChecked = selectedCustomizations.some((c) => c.id === cust.id);
              return (
                <div
                  key={cust.id}
                  onClick={() => onToggleCustomization(cust)}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none",
                    isChecked
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                      : "border-border/60 bg-card hover:bg-muted/50 hover:border-primary/40",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => onToggleCustomization(cust)}
                      className="h-3.5 w-3.5 data-[state=checked]:bg-primary data-[state=checked]:text-white"
                    />
                    <span className="text-xs font-semibold text-foreground">{cust.name}</span>
                  </div>

                  <span className="text-xs font-bold text-primary">
                    +{cust.priceAdjustment > 0 ? `$${cust.priceAdjustment.toFixed(2)}` : "Free"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP 3: Quantity & Order Controls ── */}
      <div className="space-y-2.5 pt-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShoppingBag className="h-3 w-3 text-primary" />
            {hasSizes && hasCustomizations
              ? "3. Quantity & Order"
              : hasSizes || hasCustomizations
                ? "2. Quantity & Order"
                : "1. Quantity & Order"}
          </span>

          {isLowStock && (
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold px-2 py-0.5"
            >
              <AlertTriangle className="h-2.5 w-2.5 mr-1" />
              Only {availableUnits} left!
            </Badge>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Quantity Controls */}
          <div className="flex items-center justify-between sm:justify-start border border-border/60 rounded-xl bg-card p-0.5 shadow-2xs sm:w-auto">
            <CustomButton
              variant="ghost"
              size="icon"
              onClick={onDecrementQuantity}
              disabled={pageQuantity <= 1 || isOutOfStock}
              className="h-8 w-8 rounded-lg hover:bg-muted text-foreground cursor-pointer disabled:opacity-30"
            >
              <Minus className="h-3.5 w-3.5" />
            </CustomButton>

            <span className="w-10 text-center text-xs font-bold text-foreground">
              {pageQuantity}
            </span>

            <CustomButton
              variant="ghost"
              size="icon"
              onClick={onIncrementQuantity}
              disabled={isOutOfStock}
              className="h-8 w-8 rounded-lg hover:bg-muted text-foreground cursor-pointer disabled:opacity-30"
            >
              <Plus className="h-3.5 w-3.5" />
            </CustomButton>
          </div>

          {/* Add to Cart Action Button */}
          <CustomButton
            variant="default"
            size="default"
            onClick={onAddToCart}
            disabled={isOutOfStock || isAddingToCart}
            className="flex-1 gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2.5 shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {isOutOfStock
              ? "Out of Stock"
              : isAddingToCart
                ? "Updating Cart..."
                : `Add to Order • $${totalPrice.toFixed(2)}`}
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
