"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Check, Package, X, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/shared/button/custom-button";
import { QuantitySelector } from "@/components/shared/input/quantity-selector";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { ProductDetailResponseModel, ProductSize } from "@/redux/features/business/store/models/response/product-response";
import { appImages } from "@/constants/app-resource/icons/app-images";

interface SizePickerModalProps {
  product: ProductDetailResponseModel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSizeSelect: (product: ProductDetailResponseModel, size?: ProductSize, quantity?: number) => void;
  isEditing?: boolean;
}

export function SizePickerModal({
  product,
  open,
  onOpenChange,
  onSizeSelect,
  isEditing = false,
}: SizePickerModalProps) {
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Initialize with first size when modal opens
  useEffect(() => {
    if (open && product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
      setQuantity(1);
    } else if (!open) {
      setSelectedSize(null);
      setQuantity(1);
    }
  }, [open, product?.id]);

  const handleSelectSize = useCallback(() => {
    if (product) {
      onSizeSelect(product, selectedSize || undefined, quantity);
      onOpenChange(false);
    }
  }, [product, selectedSize, quantity, onSizeSelect, onOpenChange]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleClearSize = useCallback(() => {
    setQuantity(1);
  }, []);

  if (!product) return null;

  const activeSizes = product?.sizes?.filter((s) => s.id) || [];

  const displayPrice = selectedSize?.finalPrice || product?.displayPrice || 0;
  const originalPrice = selectedSize?.hasPromotion
    ? selectedSize.price
    : product?.hasActivePromotion
    ? product?.displayOriginPrice
    : null;
  const hasDiscount = selectedSize
    ? selectedSize.hasPromotion
    : product?.hasActivePromotion;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[480px] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg font-bold">
            {isEditing ? "Edit Size" : "Choose Size"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 pt-2">
          {/* Product Info */}
              <div className="flex gap-4 mb-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={product?.mainImageUrl || appImages.NoImage}
                    alt={product?.name || "Product"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                    {product?.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(displayPrice)}
                    </span>
                    {hasDiscount && originalPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatCurrency(originalPrice)}
                      </span>
                    )}
                  </div>
                  {hasDiscount && (
                    <Badge variant="destructive" className="text-xs mt-1">
                      {selectedSize?.hasPromotion
                        ? `-${Math.round(
                            ((selectedSize.price - selectedSize.finalPrice) /
                              selectedSize.price) *
                            100
                          )}%`
                        : product?.displayPromotionType === "PERCENTAGE"
                        ? `-${product?.displayPromotionValue}%`
                        : `-${formatCurrency(
                            product?.displayPromotionValue || 0
                          )}`}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Size Selection */}
              {activeSizes.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-sm">Choose Size</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeSizes.map((size) => {
                      const isActive = selectedSize?.id === size.id;
                      return (
                        <button
                          key={size.id}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "relative border-2 rounded-lg px-3 py-2 transition-all cursor-pointer hover:border-primary",
                            isActive
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "border-border"
                          )}
                        >
                          <div className="font-semibold text-xs">{size.name}</div>
                          <div className="text-primary font-bold text-sm">
                            {formatCurrency(size.finalPrice)}
                          </div>
                          {size.hasPromotion && (
                            <div className="text-xs text-muted-foreground line-through">
                              {formatCurrency(size.price)}
                            </div>
                          )}
                          {isActive && (
                            <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                              <Check className="h-2.5 w-2.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-sm">Quantity</h4>
                <div className="flex items-center gap-2">
                  <QuantitySelector
                    value={quantity}
                    onChange={setQuantity}
                    min={1}
                    size="sm"
                  />
                  {/* Clear button */}
                  {quantity > 0 && (
                    <CustomButton
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={handleClearSize}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Clear
                    </CustomButton>
                  )}
                  <div className="flex-1" />
                  <span className="text-sm font-semibold">
                    {formatCurrency(displayPrice * quantity)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-3 border-t mb-4">
                <span className="text-muted-foreground">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(displayPrice * quantity)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <CustomButton
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Cancel
                </CustomButton>
                <CustomButton
                  className="flex-1"
                  onClick={handleSelectSize}
                >
                  <Package className="h-4 w-4 mr-1.5" />
                  Add to Cart
                </CustomButton>
              </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
