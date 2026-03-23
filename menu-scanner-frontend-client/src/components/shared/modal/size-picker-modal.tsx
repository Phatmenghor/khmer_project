"use client";

import { useState, useCallback, useEffect } from "react";
import { Check, Package, ChevronRight, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/shared/button/custom-button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { ProductDetailResponseModel, ProductSize } from "@/redux/features/business/store/models/response/product-response";
import { showToast } from "@/components/shared/common/show-toast";
import { axiosClientWithAuth } from "@/utils/axios";

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
  const [fullProduct, setFullProduct] = useState<ProductDetailResponseModel | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Use full product if available, otherwise use listing product
  const displayProduct = fullProduct || product;

  // Fetch full product details if sizes are missing
  useEffect(() => {
    if (open && product) {
      // Check if we need to fetch full product details
      const needsFetch = product.hasSizes && (!product.sizes || product.sizes.length === 0);

      if (needsFetch) {
        setIsLoadingDetail(true);
        setFullProduct(null);
        setSelectedSize(null);

        // Fetch from POS product endpoint
        axiosClientWithAuth
          .get(`/api/v1/products/${product.id}`)
          .then((response) => {
            const detail = response.data.data;
            setFullProduct(detail);
            if (detail.sizes && detail.sizes.length > 0) {
              setSelectedSize(detail.sizes[0]);
            }
          })
          .catch(() => {
            showToast.error("Failed to load product details");
          })
          .finally(() => {
            setIsLoadingDetail(false);
          });
      } else {
        setFullProduct(null);
        if (product.sizes && product.sizes.length > 0) {
          setSelectedSize(product.sizes[0]);
        } else {
          setSelectedSize(null);
        }
      }
    }

    if (!open) {
      setFullProduct(null);
      setSelectedSize(null);
      setQuantity(1);
      setIsLoadingDetail(false);
    }
  }, [open, product?.id, product?.hasSizes, product?.sizes?.length]);

  const handleSelectSize = useCallback(() => {
    if (displayProduct) {
      onSizeSelect(displayProduct, selectedSize || undefined, quantity);
      onOpenChange(false);
    }
  }, [displayProduct, selectedSize, quantity, onSizeSelect, onOpenChange]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  if (!product) return null;

  const activeSizes = displayProduct?.sizes?.filter((s) => s.id) || [];

  const displayPrice = selectedSize?.finalPrice || displayProduct?.displayPrice || 0;
  const originalPrice = selectedSize?.hasPromotion
    ? selectedSize.price
    : displayProduct?.hasActivePromotion
    ? displayProduct?.displayOriginPrice
    : null;
  const hasDiscount = selectedSize
    ? selectedSize.hasPromotion
    : displayProduct?.hasActivePromotion;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {isEditing ? "Edit Size" : "Choose Size"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Loading State */}
          {isLoadingDetail ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">
                Loading product details...
              </p>
            </div>
          ) : (
            <>
              {/* Product Info */}
              <div>
                <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                  {displayProduct?.name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
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
              <Badge variant="destructive" className="text-xs">
                {selectedSize?.hasPromotion
                  ? `-${Math.round(
                      ((selectedSize.price - selectedSize.finalPrice) /
                        selectedSize.price) *
                        100
                    )}%`
                  : product.displayPromotionType === "PERCENTAGE"
                  ? `-${product.displayPromotionValue}%`
                  : `-${formatCurrency(product.displayPromotionValue || 0)}`}
              </Badge>
            )}
          </div>

          {/* Size Selection */}
          {activeSizes.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Choose Size
              </p>
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Quantity
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-8 w-8 rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.max(1, val));
                }}
                className="h-8 w-12 text-center border border-border rounded-lg"
                min="1"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="h-8 w-8 rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center"
              >
                +
              </button>
              <div className="flex-1" />
              <span className="text-sm font-semibold">
                {formatCurrency(displayPrice * quantity)}
              </span>
            </div>
          </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <CustomButton
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  className="flex-1 gap-1.5"
                  onClick={handleSelectSize}
                >
                  <Package className="h-4 w-4" />
                  Add to Cart
                </CustomButton>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
