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
  // Track pending quantities for each size
  const [pendingQuantities, setPendingQuantities] = useState<Map<string, number>>(new Map());
  // Track which sizes have been modified
  const [modifiedSizes, setModifiedSizes] = useState<Set<string>>(new Set());

  // Check if there are unsaved changes
  const hasChanges = modifiedSizes.size > 0;

  // Initialize with first size when modal opens
  useEffect(() => {
    if (open && product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
      setQuantity(1);
      setPendingQuantities(new Map());
      setModifiedSizes(new Set());
    } else if (!open) {
      setSelectedSize(null);
      setQuantity(1);
      setPendingQuantities(new Map());
      setModifiedSizes(new Set());
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

  // Handle quantity change and track modifications
  const handleQuantityChange = useCallback((newQuantity: number) => {
    setQuantity(newQuantity);

    if (!selectedSize) return;

    const key = selectedSize.id;
    setPendingQuantities((prev) => {
      const next = new Map(prev);
      next.set(key, newQuantity);
      return next;
    });

    // Track as modified
    setModifiedSizes((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, [selectedSize]);

  const handleClearSize = useCallback(() => {
    setQuantity(0);

    if (!selectedSize) return;

    const key = selectedSize.id;
    setPendingQuantities((prev) => {
      const next = new Map(prev);
      next.set(key, 0);
      return next;
    });

    setModifiedSizes((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, [selectedSize]);

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
                  const sizeQty = pendingQuantities.get(size.id) ?? 0;
                  const isModified = modifiedSizes.has(size.id) && sizeQty > 0;

                  return (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "relative border-2 rounded-lg px-3 py-2 transition-all cursor-pointer hover:border-primary",
                        isActive
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border",
                        isModified && "ring-2 ring-amber-400/50"
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
                      {/* Quantity badge on size button */}
                      {sizeQty > 0 && (
                        <div
                          className={cn(
                            "absolute -top-1.5 -left-1.5 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold",
                            isModified ? "bg-amber-500" : "bg-green-500"
                          )}
                        >
                          {sizeQty}
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
                onChange={handleQuantityChange}
                min={0}
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
              disabled={quantity === 0}
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
