"use client";

import { useEffect } from "react";
import { dateTimeFormat, dateFormatLocal } from "@/utils/date/date-time-format";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectIsFetchingDetail,
  selectSelectedProduct,
} from "../store/selectors/product-selector";
import { fetchProductByIdService } from "../store/thunks/product-thunks";
import { clearSelectedProduct } from "../store/slice/product-slice";
import { formatCurrency } from "@/utils/common/currency-format";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loading } from "@/components/shared/common/loading";
import { cn } from "@/lib/utils";
import { Package, Eye, Heart, Box } from "lucide-react";

interface ProductDetailModalProps {
  productId?: string;
  isOpen: boolean;
  onClose: () => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5">
      <h3 className="text-xs font-bold text-foreground">
        {children}
      </h3>
    </div>
  );
}

function InfoRow({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", fullWidth && "col-span-2")}>
      <span className="text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      <span className="text-xs text-foreground break-words">{value || "-"}</span>
    </div>
  );
}

export function ProductDetailModal({
  productId,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const productData = useAppSelector(selectSelectedProduct);

  useEffect(() => {
    if (!productId || !isOpen) return;
    dispatch(fetchProductByIdService(productId)).unwrap().catch(() => {});
  }, [productId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedProduct());
    onClose();
  };

  if (isFetchingDetail) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">Product Details Loading</DialogTitle>
        <DialogContent className="w-full sm:max-w-5xl max-h-[92vh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-64">
            <Loading />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!productData) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">Product Details</DialogTitle>
        <DialogContent className="w-full sm:max-w-5xl max-h-[92vh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-muted-foreground">No product data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const isActive = productData.status === "ACTIVE";
  const hasPromo = productData.hasPromotion;

  const promoLabel = hasPromo
    ? productData.displayPromotionType === "PERCENTAGE"
      ? `${productData.displayPromotionValue}% OFF`
      : productData.displayPromotionType === "FIXED"
        ? `${formatCurrency(productData.displayPromotionValue || 0)} OFF`
        : "On Sale"
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">
        Product Details - {productData.name}
      </DialogTitle>

      <DialogContent className="w-full sm:max-w-5xl max-h-[92vh] p-0 gap-0 flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0 flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-muted border border-border/50 flex items-center justify-center">
            {(productData.mainImage?.md || productData.mainImage?.sm) ? (
              <img
                src={productData.mainImage?.md || productData.mainImage?.sm}
                alt={productData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">Product</p>
            <p className="text-xs text-muted-foreground mt-0.5">Manage products for your business</p>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 grid grid-cols-1 lg:grid-cols-3 gap-3">

            {/* ── Left column ── */}
            <div className="lg:col-span-2 space-y-3">

              {/* Product Info */}
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>Product Information</SectionTitle>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <InfoRow label="Name" value={productData.name} fullWidth />
                  <InfoRow label="Description" value={productData.description} fullWidth />
                  <InfoRow label="Category" value={productData.categoryName || "-"} />
                  <InfoRow label="Brand" value={productData.brandName || "-"} />
                  <InfoRow label="SKU" value={productData.sku || "-"} />
                  <InfoRow label="Barcode" value={productData.barcode || "-"} />
                  <InfoRow label="Has Sizes" value={productData.hasSizes ? "Yes" : "No"} />
                  <InfoRow
                    label="Items"
                    value={
                      productData.sizes && productData.sizes.length > 0
                        ? `${productData.sizes.length} size${productData.sizes.length > 1 ? "s" : ""}`
                        : "No sizes"
                    }
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>Pricing</SectionTitle>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <InfoRow
                    label="Base Price"
                    value={
                      productData.price
                        ? formatCurrency(parseFloat(productData.price) || 0)
                        : "-"
                    }
                  />
                  <InfoRow
                    label="Display Price"
                    value={
                      <span className="font-semibold text-foreground">
                        {formatCurrency(productData.displayPrice)}
                      </span>
                    }
                  />
                  {productData.displayOriginPrice !== productData.displayPrice && (
                    <InfoRow
                      label="Original Price"
                      value={
                        <span className="line-through text-muted-foreground">
                          {formatCurrency(productData.displayOriginPrice)}
                        </span>
                      }
                    />
                  )}
                  {hasPromo && (
                    <>
                      <InfoRow
                        label="Promotion"
                        value={
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">
                            {promoLabel}
                          </span>
                        }
                      />
                      <InfoRow
                        label="Promo Type"
                        value={productData.displayPromotionType || "-"}
                      />
                      <InfoRow
                        label="Promo Period"
                        value={
                          productData.displayPromotionFromDate &&
                          productData.displayPromotionToDate
                            ? `${dateFormatLocal(productData.displayPromotionFromDate)} – ${dateFormatLocal(productData.displayPromotionToDate)}`
                            : "-"
                        }
                        fullWidth
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Sizes */}
              {productData.hasSizes &&
                productData.sizes &&
                productData.sizes.length > 0 && (
                  <div className="rounded border border-border/50 bg-card p-3">
                    <SectionTitle>
                      Sizes ({productData.sizes.length})
                    </SectionTitle>
                    <div className="grid grid-cols-1 gap-2">
                      {productData.sizes.map((size) => {
                        const sizePromoLabel = size.hasPromotion
                          ? size.promotionType === "PERCENTAGE"
                            ? `${size.promotionValue}% OFF`
                            : `${formatCurrency(size.promotionValue || 0)} OFF`
                          : null;
                        return (
                          <div
                            key={size.id}
                            className="border border-border/50 rounded p-2.5 bg-muted/20 space-y-2"
                          >
                            {/* Size header */}
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-foreground">
                                {size.name}
                              </span>
                              {sizePromoLabel && (
                                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold leading-none">
                                  {sizePromoLabel}
                                </span>
                              )}
                            </div>

                            {/* Pricing row */}
                            <div className="flex items-center gap-2 text-xs">
                              {size.hasPromotion ? (
                                <>
                                  <span className="line-through text-muted-foreground">
                                    {formatCurrency(size.price)}
                                  </span>
                                  <span className="font-bold text-foreground">
                                    {formatCurrency(size.finalPrice)}
                                  </span>
                                </>
                              ) : (
                                <span className="font-bold text-foreground">
                                  {formatCurrency(size.price)}
                                </span>
                              )}
                              {size.hasPromotion &&
                                size.promotionFromDate &&
                                size.promotionToDate && (
                                  <span className="text-muted-foreground ml-auto">
                                    {dateFormatLocal(size.promotionFromDate)} –{" "}
                                    {dateFormatLocal(size.promotionToDate)}
                                  </span>
                                )}
                            </div>

                            {/* SKU / Stock row */}
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                              <InfoRow label="SKU" value={size.sku || "-"} />
                              <InfoRow
                                label="Stock"
                                value={
                                  <span
                                    className={cn(
                                      "font-semibold",
                                      (size.totalStock ?? 0) === 0
                                        ? "text-red-600"
                                        : (size.totalStock ?? 0) <= 5
                                          ? "text-amber-600"
                                          : "text-green-600"
                                    )}
                                  >
                                    {size.totalStock ?? 0}
                                  </span>
                                }
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Images */}
              {productData.images && productData.images.length > 0 && (
                <div className="rounded border border-border/50 bg-card p-3">
                  <SectionTitle>
                    Images ({productData.images.length})
                  </SectionTitle>
                  <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-1.5">
                    {productData.images.map((image, idx) => (
                      <div
                        key={image.id}
                        className="aspect-square rounded overflow-hidden border border-border/50 hover:border-primary/50 transition-colors"
                      >
                        <img
                          src={image.image?.md || image.image?.sm}
                          alt={`Image ${idx + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right sidebar ── */}
            <div className="space-y-3">

              {/* Engagement */}
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>Engagement</SectionTitle>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col items-center gap-1 p-2 rounded bg-muted/30 border border-border/40">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-bold text-foreground">
                      {(productData.viewCount ?? 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">Views</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 rounded bg-muted/30 border border-border/40">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-bold text-foreground">
                      {(productData.favoriteCount ?? 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">Favorites</span>
                  </div>
                </div>
              </div>

              {/* Customizations */}
              {productData.customizations &&
                productData.customizations.length > 0 && (
                  <div className="rounded border border-border/50 bg-card p-3">
                    <SectionTitle>
                      Customizations ({productData.customizations.length})
                    </SectionTitle>
                    <div className="space-y-1">
                      {productData.customizations.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between px-2 py-1.5 bg-blue-50 border border-blue-100 rounded text-xs"
                        >
                          <span className="font-medium text-blue-700">{c.name}</span>
                          {(c.priceAdjustment ?? 0) > 0 && (
                            <span className="font-bold text-blue-700">
                              +{formatCurrency(c.priceAdjustment)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Stock */}
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>Stock</SectionTitle>
                <div className="space-y-2">
                  {/* Stock status badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Status
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-semibold",
                        productData.stockStatus === "ENABLED"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {productData.stockStatus || "-"}
                    </span>
                  </div>

                  <div className="pt-1 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Box className="h-3 w-3" /> Total
                      </span>
                      <span className="font-bold text-foreground">
                        {productData.totalStock ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Available</span>
                      <span
                        className={cn(
                          "font-semibold",
                          (productData.quantityAvailable ?? 0) === 0
                            ? "text-red-600"
                            : (productData.quantityAvailable ?? 0) <= 5
                              ? "text-amber-600"
                              : "text-green-600"
                        )}
                      >
                        {productData.quantityAvailable ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Reserved</span>
                      <span className="font-semibold text-blue-600">
                        {productData.quantityReserved ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">On Hand</span>
                      <span className="font-semibold text-foreground">
                        {productData.quantityOnHand ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Info */}
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>System Info</SectionTitle>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <InfoRow label="Created By" value={productData.createdBy || "-"} />
                  <InfoRow
                    label="Created At"
                    value={dateTimeFormat(productData.createdAt ?? "")}
                  />
                  <InfoRow label="Updated By" value={productData.updatedBy || "-"} />
                  <InfoRow
                    label="Last Updated"
                    value={dateTimeFormat(productData.updatedAt ?? "")}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
