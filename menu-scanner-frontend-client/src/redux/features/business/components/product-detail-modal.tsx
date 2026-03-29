"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import {
  selectIsFetchingDetail,
  selectSelectedProduct,
} from "../store/selectors/product-selector";
import { fetchProductByIdService } from "../store/thunks/product-thunks";
import { clearSelectedProduct } from "../store/slice/product-slice";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/common/currency-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { Loading } from "@/components/shared/common/loading";
import { formatEnumValue } from "@/utils/format/enum-formatter";

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
      } catch (error: any) {
        console.error("Error fetching product data:", error);
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
      <DialogTitle className="sr-only">Product Details - {productData.name}</DialogTitle>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground">
              Product Details
            </h2>
            <p className="text-sm text-foreground mt-1">
              View detailed information about the product
            </p>
            <div className="mt-3 space-y-1">
              <p className="text-sm font-medium text-foreground">
                {productData.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {productData.categoryName} • {productData.brandName}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField label="Product Name" value={productData.name} />
                  <DisplayField
                    label="Description"
                    value={productData.description || "---"}
                  />
                  <DisplayField label="Category" value={productData.categoryName || "---"} />
                  <DisplayField label="Brand" value={productData.brandName || "---"} />
                  <DisplayField
                    label="Status"
                    value={formatEnumValue(productData.status) || "---"}
                  />
                  <DisplayField label="SKU" value={productData.sku || "---"} />
                  <DisplayField label="Barcode" value={productData.barcode || "---"} />
                  <DisplayField
                    label="Has Sizes"
                    value={
                      <Badge variant={productData.hasSizes ? "default" : "outline"}>
                        {productData.hasSizes ? "Yes" : "No"}
                      </Badge>
                    }
                  />
                  <DisplayField label="Business" value={productData.businessName || "---"} />
                  <DisplayField
                    label="Total Stock"
                    value={productData.totalStock?.toLocaleString() || "0"}
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

            {/* Pricing Information */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField
                    label="Base Price"
                    value={formatCurrency(productData.price)}
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
                            : formatCurrency(productData.displayPromotionValue || 0)
                        }
                      />
                      <DisplayField
                        label="Promotion Valid From"
                        value={dateTimeFormat(productData.displayPromotionFromDate ?? "")}
                      />
                      <DisplayField
                        label="Promotion Valid Until"
                        value={dateTimeFormat(productData.displayPromotionToDate ?? "")}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            {productData.images && productData.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {productData.images.map((image, index) => (
                      <div
                        key={image.id}
                        className="relative aspect-square rounded-lg overflow-hidden border hover:shadow-md transition-shadow"
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

            {/* Product Sizes */}
            {productData.hasSizes &&
              productData.sizes &&
              productData.sizes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Available Sizes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {productData.sizes.map((size) => (
                        <div
                          key={size.id}
                          className="border rounded-lg p-4 space-y-4"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-foreground">
                              {size.name}
                            </h4>
                            <Badge
                              variant={size.hasPromotion ? "default" : "outline"}
                            >
                              {size.hasPromotion ? "On Sale" : "Regular"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <DisplayField
                              label="Price"
                              value={formatCurrency(size.price)}
                            />
                            <DisplayField
                              label="Final Price"
                              value={
                                <span className="text-green-600 font-semibold">
                                  {formatCurrency(size.finalPrice)}
                                </span>
                              }
                            />
                            {size.hasPromotion && (
                              <>
                                <DisplayField
                                  label="Promotion Type"
                                  value={size.promotionType || "---"}
                                />
                                <DisplayField
                                  label="Promotion Value"
                                  value={
                                    size.promotionType === "PERCENTAGE"
                                      ? `${size.promotionValue}%`
                                      : formatCurrency(size.promotionValue || 0)
                                  }
                                />
                                <DisplayField
                                  label="Valid Until"
                                  value={dateTimeFormat(size.promotionToDate ?? "")}
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

            {/* Engagement Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField
                    label="View Count"
                    value={productData.viewCount?.toLocaleString() || "0"}
                  />
                  <DisplayField
                    label="Favorite Count"
                    value={productData.favoriteCount?.toLocaleString() || "0"}
                  />
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
