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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { Loading } from "@/components/shared/common/loading";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { Badge } from "@/components/ui/badge";

interface ProductDetailModalProps {
  productId?: string;
  isOpen: boolean;
  onClose: () => void;
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
    const fetchProductData = async () => {
      if (!productId || !isOpen) return;
      try {
        await dispatch(fetchProductByIdService(productId)).unwrap();
      } catch (error: unknown) {
      }
    };

    fetchProductData();
  }, [productId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedProduct());
    onClose();
  };

  if (isFetchingDetail) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">Product Details Loading</DialogTitle>
        <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
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
        <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No product data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">
        Product Details - {productData.name}
      </DialogTitle>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 flex-shrink-0 rounded overflow-hidden border bg-muted">
              {productData.mainImageUrl ? (
                <img
                  src={productData.mainImageUrl}
                  alt={productData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    No image
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xs font-semibold text-foreground">
                Product Details
              </h2>
              <p className="text-xs text-foreground mt-1">
                View detailed information about the product
              </p>
            </div>
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <DisplayField label="Product Name" value={productData.name} />
                  <DisplayField
                    label="Description"
                    value={productData.description || "---"}
                  />
                  <DisplayField
                    label="Category"
                    value={productData.categoryName || "---"}
                  />
                  <DisplayField
                    label="Brand"
                    value={productData.brandName || "---"}
                  />
                  <DisplayField
                    label="Status"
                    value={formatEnumValue(productData.status) || "---"}
                  />
                  <DisplayField label="SKU" value={productData.sku || "---"} />
                  <DisplayField
                    label="Barcode"
                    value={productData.barcode || "---"}
                  />
                  <DisplayField
                    label="Has Sizes"
                    value={productData.hasSizes ? "Yes" : "No"}
                  />
                  <DisplayField
                    label="Business"
                    value={productData.businessName || "---"}
                  />
                  <DisplayField
                    label="Items"
                    value={
                      productData.sizes && productData.sizes.length > 0
                        ? `${productData.sizes.length} items`
                        : "No items"
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <DisplayField
                    label="Base Price"
                    value={
                      productData.price
                        ? formatCurrency(parseFloat(productData.price) || 0)
                        : "---"
                    }
                  />
                  <DisplayField
                    label="Display Price"
                    value={formatCurrency(productData.displayPrice)}
                  />
                  <DisplayField
                    label="Display Origin Price"
                    value={formatCurrency(productData.displayOriginPrice)}
                  />
                  {productData.hasPromotion && (
                    <>
                      <DisplayField
                        label="Promotion Type"
                        value={productData.displayPromotionType || "---"}
                      />
                      <DisplayField
                        label="Promotion Value"
                        value={
                          productData.displayPromotionType === "PERCENTAGE"
                            ? `${productData.displayPromotionValue}%`
                            : formatCurrency(
                                productData.displayPromotionValue || 0,
                              )
                        }
                      />
                      <DisplayField
                        label="Promotion Valid From"
                        value={dateFormatLocal(
                          productData.displayPromotionFromDate ?? "",
                        )}
                      />
                      <DisplayField
                        label="Promotion Valid Until"
                        value={dateFormatLocal(
                          productData.displayPromotionToDate ?? "",
                        )}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {}
            {productData.images && productData.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1">
                    {productData.images.map((image, index) => (
                      <div
                        key={image.id}
                        className="relative aspect-square rounded overflow-hidden border hover:shadow-md transition-shadow"
                      >
                        <img
                          src={image.imageUrl}
                          alt={`Product image ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {}
            {productData.hasSizes &&
              productData.sizes &&
              productData.sizes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Available Sizes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {productData.sizes.map((size) => (
                        <div
                          key={size.id}
                          className="border rounded p-3 space-y-3"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-foreground">
                              {size.name}
                            </h4>
                            <Badge
                              variant={
                                size.hasPromotion ? "default" : "outline"
                              }
                            >
                              {size.hasPromotion ? "Promotion" : "Regular"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <DisplayField
                              label="Price"
                              value={formatCurrency(size.price)}
                            />
                            <DisplayField
                              label="Final Price"
                              value={formatCurrency(size.finalPrice)}
                            />
                            <DisplayField
                              label="SKU"
                              value={size.sku || "---"}
                            />
                            <DisplayField
                              label="Barcode"
                              value={size.barcode || "---"}
                            />
                            <DisplayField
                              label="Total Stock"
                              value={size.totalStock ? size.totalStock.toString() : "0"}
                            />
                            {size.hasPromotion && (
                              <>
                                <DisplayField
                                  label="Promotion Value"
                                  value={
                                    size.promotionType === "PERCENTAGE"
                                      ? `${size.promotionValue}%`
                                      : formatCurrency(size.promotionValue || 0)
                                  }
                                />
                                <DisplayField
                                  label="Promotion From"
                                  value={dateFormatLocal(
                                    size.promotionFromDate ?? "",
                                  )}
                                />
                                <DisplayField
                                  label="Promotion To"
                                  value={dateFormatLocal(
                                    size.promotionToDate ?? "",
                                  )}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {}
            <Card>
              <CardHeader>
                <CardTitle>Stock Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <DisplayField
                    label="Stock Status"
                    value={
                      <Badge
                        variant={
                          productData.stockStatus === "ENABLED"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {productData.stockStatus || "---"}
                      </Badge>
                    }
                  />
                  <DisplayField
                    label="Total Stock"
                    value={productData.totalStock ? productData.totalStock.toString() : "0"}
                  />
                  <DisplayField
                    label="Quantity Available"
                    value={productData.quantityAvailable ? productData.quantityAvailable.toString() : "0"}
                  />
                  <DisplayField
                    label="Quantity Reserved"
                    value={productData.quantityReserved ? productData.quantityReserved.toString() : "0"}
                  />
                  <DisplayField
                    label="Quantity On Hand"
                    value={productData.quantityOnHand ? productData.quantityOnHand.toString() : "0"}
                  />
                </div>
              </CardContent>
            </Card>

            {}
            {productData.customizations &&
              productData.customizations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Product Customizations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {productData.customizations.map((customization) => (
                        <div
                          key={customization.id}
                          className="border rounded p-3 space-y-2"
                        >
                          <h4 className="font-semibold text-foreground">
                            {customization.name}
                          </h4>
                          <div className="space-y-2 text-xs">
                            <DisplayField
                              label="Price Adjustment"
                              value={formatCurrency(
                                customization.priceAdjustment || 0,
                              )}
                            />
                            {customization.createdAt && (
                              <DisplayField
                                label="Created At"
                                value={dateTimeFormat(customization.createdAt)}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <DisplayField
                    label="View Count"
                    value={
                      productData.viewCount
                        ? productData.viewCount.toLocaleString()
                        : "0"
                    }
                  />
                  <DisplayField
                    label="Favorite Count"
                    value={
                      productData.favoriteCount
                        ? productData.favoriteCount.toLocaleString()
                        : "0"
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <DisplayField label="Product ID" value={productData.id} />
                  <DisplayField
                    label="Created At"
                    value={dateTimeFormat(productData.createdAt ?? "")}
                  />
                  <DisplayField
                    label="Created By"
                    value={productData.createdBy || "---"}
                  />
                  <DisplayField
                    label="Last Updated"
                    value={dateTimeFormat(productData.updatedAt ?? "")}
                  />
                  <DisplayField
                    label="Updated By"
                    value={productData.updatedBy || "---"}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
