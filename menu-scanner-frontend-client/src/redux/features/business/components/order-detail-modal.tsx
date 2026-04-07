"use client";

import { useEffect, useState } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectOrderAdminIsFetchingDetail,
  selectSelectedOrder,
  selectOrderAdminDetailError,
} from "../store/selectors/order-admin-selector";
import { fetchOrderByIdAdminService } from "../store/thunks/order-admin-thunks";
import { clearSelectedOrder } from "../store/slice/order-admin-slice";
import { formatCurrency } from "@/utils/common/currency-format";
import { getOrderStatusLabel } from "@/enums/order-status.enum";
import { Loading } from "@/components/shared/common/loading";
import { DisplayField } from "@/components/shared/form-field/display-field";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface OrderDetailModalProps {
  orderId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailModal({
  orderId,
  isOpen,
  onClose,
}: OrderDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectOrderAdminIsFetchingDetail);
  const orderData = useAppSelector(selectSelectedOrder);
  const detailError = useAppSelector(selectOrderAdminDetailError);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    if (!orderId || !isOpen) return;
    dispatch(fetchOrderByIdAdminService(orderId));
  }, [orderId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedOrder());
    onClose();
  };

  const locationImages = orderData?.deliveryAddress?.locationImages || [];
  const handleNextImage = () => {
    setImageIndex((prev) => (prev + 1) % (locationImages.length || 1));
  };
  const handlePrevImage = () => {
    setImageIndex((prev) =>
      prev === 0 ? (locationImages.length || 1) - 1 : prev - 1
    );
  };

  if (isFetchingDetail) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">Order Details Loading</DialogTitle>
        <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <Loading />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!orderData) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">Order Details</DialogTitle>
        <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground">
                {detailError
                  ? `Error: ${detailError}`
                  : "No order data available"}
              </p>
              {detailError && (
                <p className="text-xs text-muted-foreground mt-2">
                  The order may have been deleted or you may not have permission to view it.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">
        Order Details - {orderData.orderNumber}
      </DialogTitle>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Order Details
            </h2>
            <p className="text-sm text-foreground mt-1">
              {orderData.orderNumber}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Order & Pricing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order & Pricing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Details */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Order Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DisplayField
                      label="Order Number"
                      value={orderData.orderNumber}
                    />
                    <DisplayField
                      label="Order Type"
                      value={
                        orderData.orderFrom === "CUSTOMER"
                          ? "Customer (Public)"
                          : "Business (POS)"
                      }
                    />
                    <DisplayField
                      label="Order Status"
                      value={getOrderStatusLabel(orderData.orderStatus)}
                    />
                    <DisplayField
                      label="Created At"
                      value={dateTimeFormat(orderData.createdAt)}
                    />
                    <DisplayField
                      label="Business"
                      value={orderData.businessName || "---"}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t" />

                {/* Pricing Details */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Pricing Details</h4>
                  <div className="space-y-6">
                    {/* Before Snapshot */}
                    {(() => {
                      const before = orderData.pricing?.before;
                      return (
                        <div className="space-y-3">
                          <h5 className="text-xs font-medium text-muted-foreground mb-2 uppercase">📌 Before (Item Discounts Applied)</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-4 border-gray-300 bg-gray-50 p-3 rounded">
                            <DisplayField
                              label="Total Items"
                              value={String(before?.totalItems || 0)}
                            />
                            <DisplayField
                              label="Original Subtotal"
                              value={formatCurrency(before?.subtotalBeforeDiscount || 0)}
                            />
                            {before?.hasActivePromotion && (before?.discountAmount ?? 0) > 0 && (
                              <>
                                <DisplayField
                                  label="Item Discounts"
                                  value={
                                    <span className="text-red-600 font-semibold">
                                      -{formatCurrency(before!.discountAmount)}
                                    </span>
                                  }
                                />
                                {before?.promotionType && (
                                  <DisplayField
                                    label="Discount Type"
                                    value={
                                      <span className="font-medium text-blue-600">
                                        {before.promotionType === "PERCENTAGE" ? "PERCENTAGE" : "FIXED_AMOUNT"}
                                      </span>
                                    }
                                  />
                                )}
                              </>
                            )}
                            <DisplayField
                              label="Subtotal After Items"
                              value={
                                <span className="font-semibold">
                                  {formatCurrency(before?.subtotal || 0)}
                                </span>
                              }
                            />
                            <DisplayField
                              label="Delivery Fee"
                              value={formatCurrency(before?.deliveryFee || 0)}
                            />
                            {(before?.taxAmount ?? 0) > 0 && (
                              <DisplayField
                                label="Tax"
                                value={formatCurrency(before!.taxAmount)}
                              />
                            )}
                            <DisplayField
                              label="Final Total"
                              value={
                                <span className="text-lg font-bold text-green-600">
                                  {formatCurrency(before?.finalTotal || 0)}
                                </span>
                              }
                            />
                          </div>
                        </div>
                      );
                    })()}

                    {/* After Snapshot (if changes occurred) */}
                    {orderData.pricing?.hadOrderLevelChangeFromPOS && orderData.pricing?.after && (
                      <div className="space-y-3">
                        <h5 className="text-xs font-medium text-muted-foreground mb-2 uppercase">🔄 After (Order-Level Discount Applied)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-4 border-orange-300 bg-orange-50 p-3 rounded">
                          <DisplayField
                            label="Total Items"
                            value={String(orderData.pricing.after?.totalItems || 0)}
                          />
                          <DisplayField
                            label="Original Subtotal"
                            value={formatCurrency(orderData.pricing.after?.subtotalBeforeDiscount || 0)}
                          />
                          {orderData.pricing.after?.hasActivePromotion && (orderData.pricing.after?.discountAmount ?? 0) > 0 && (
                            <>
                              <DisplayField
                                label="All Discounts (Items + Order)"
                                value={
                                  <span className="text-red-600 font-semibold">
                                    -{formatCurrency(orderData.pricing.after!.discountAmount)}
                                  </span>
                                }
                              />
                              {orderData.pricing.after?.promotionType && (
                                <DisplayField
                                  label="Order Discount Type"
                                  value={
                                    <span className="font-medium text-orange-600">
                                      {orderData.pricing.after.promotionType === "PERCENTAGE" ? "PERCENTAGE" : "FIXED_AMOUNT"}
                                    </span>
                                  }
                                />
                              )}
                              {orderData.pricing.after?.promotionValue && orderData.pricing.after.promotionValue > 0 && (
                                <DisplayField
                                  label="Order Discount Amount"
                                  value={
                                    <span className="font-semibold text-orange-600">
                                      {orderData.pricing.after.promotionType === "PERCENTAGE"
                                        ? `${orderData.pricing.after.promotionValue}%`
                                        : formatCurrency(orderData.pricing.after.promotionValue)}
                                    </span>
                                  }
                                />
                              )}
                            </>
                          )}
                          <DisplayField
                            label="Subtotal After All"
                            value={
                              <span className="font-semibold">
                                {formatCurrency(orderData.pricing.after?.subtotal || 0)}
                              </span>
                            }
                          />
                          <DisplayField
                            label="Delivery Fee"
                            value={formatCurrency(orderData.pricing.after?.deliveryFee || 0)}
                          />
                          {(orderData.pricing.after?.taxAmount ?? 0) > 0 && (
                            <DisplayField
                              label="Tax"
                              value={formatCurrency(orderData.pricing.after!.taxAmount)}
                            />
                          )}
                          <DisplayField
                            label="Final Total"
                            value={
                              <span className="text-lg font-bold text-green-600">
                                {formatCurrency(orderData.pricing.after?.finalTotal || 0)}
                              </span>
                            }
                          />
                        </div>
                        {orderData.pricing?.reason && (
                          <div className="pl-4 border-l-4 border-orange-300 bg-orange-100 p-3 rounded">
                            <p className="text-xs text-muted-foreground">
                              <span className="font-semibold">Reason:</span> {orderData.pricing.reason}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            {orderData.items && orderData.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Order Items ({orderData.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orderData.items.map((item, idx) => {
                    const before = item.before;
                    const after = item.after;
                    // Show 'after' if item changed from POS, otherwise show 'before'
                    const current = item.hadChangeFromPOS ? (after ?? before) : (before ?? after);

                    return (
                      <div
                        key={item.id}
                        className={`p-4 border rounded-lg ${
                          item.hadChangeFromPOS
                            ? "bg-orange-50 border-orange-200"
                            : "bg-gray-50"
                        }`}
                      >
                        {/* Product Image and Header */}
                        <div className="mb-3">
                          <div className="flex items-start gap-3">
                            {/* Product Image - 64x64 */}
                            {item.product?.imageUrl && (
                              <div className="flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  className="w-16 h-16 object-cover"
                                />
                              </div>
                            )}
                            {/* Product Name, Badges, and Details */}
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h4 className="font-semibold text-sm">
                                  #{idx + 1} - {item.product?.name || "Unknown"}
                                </h4>
                                <div className="flex gap-2">
                                  {(current?.discountAmount ?? 0) > 0 && (
                                    <span className="text-xs px-2 py-1 bg-red-600 text-white rounded whitespace-nowrap">
                                      💰 Discounted
                                    </span>
                                  )}
                                  {item.hadChangeFromPOS && (
                                    <span className="text-xs px-2 py-1 bg-orange-600 text-white rounded whitespace-nowrap">
                                      Modified
                                    </span>
                                  )}
                                </div>
                              </div>
                              {/* Size, SKU, and Barcode - under product name */}
                              <div className="flex flex-wrap gap-3 text-xs">
                                {item.product?.sizeName && item.product?.sku && (
                                  <span className="text-muted-foreground">
                                    Size: <span className="font-medium">{item.product.sizeName}</span>
                                    {" | "}
                                    SKU: <span className="font-mono font-medium text-foreground">{item.product.sku}</span>
                                  </span>
                                )}
                                {item.product?.barcode && (
                                  <span className="text-muted-foreground">
                                    Barcode: <span className="font-mono font-medium text-foreground">{item.product.barcode}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Current State - Show Before if no changes, After if changes occurred */}
                        <div className="space-y-4">
                          <div>
                            <h5 className="text-xs font-medium text-muted-foreground mb-2 uppercase">
                              {item.hadChangeFromPOS ? "After Changes" : "Current"}
                            </h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs pl-2 border-l-2 border-current">
                              <div>
                                <span className="text-muted-foreground">
                                  Quantity:
                                </span>
                                <p className="font-medium">
                                  {current?.quantity || 0}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Price:</span>
                                <p className="font-medium">
                                  {formatCurrency(current?.finalPrice || 0)}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Total:</span>
                                <p className="font-bold text-green-600">
                                  {formatCurrency(current?.totalPrice || 0)}
                                </p>
                              </div>
                              {(current?.discountAmount ?? 0) > 0 && (
                                <div>
                                  <span className="text-muted-foreground">
                                    Discount:
                                  </span>
                                  <p className="font-medium text-red-600">
                                    -{formatCurrency(current!.discountAmount)}
                                  </p>
                                </div>
                              )}
                              {current?.hasActivePromotion && current?.promotionValue !== null && (
                                <div>
                                  <span className="text-muted-foreground">
                                    Promo:
                                  </span>
                                  <p className="font-medium text-green-600 text-sm">
                                    {current.promotionType === "PERCENTAGE"
                                      ? `${current.promotionValue}%`
                                      : `$${current.promotionValue.toFixed(2)}`}
                                  </p>
                                </div>
                              )}

                              {item.hadChangeFromPOS && before && (
                                <div className="col-span-full text-muted-foreground">
                                  Original:{" "}
                                  {formatCurrency(before.finalPrice)} → Current:{" "}
                                  {formatCurrency(current?.finalPrice || 0)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {item.hadChangeFromPOS && item.reason && (
                          <div className="mt-2 text-xs p-2 bg-orange-100 rounded">
                            <span className="font-medium">Reason: </span>
                            {item.reason}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Customer Information */}
            <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-transparent">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  👤 Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField
                    label="Name"
                    value={
                      <span className="font-semibold text-foreground">
                        {orderData.customerName || "Walk-in Customer"}
                      </span>
                    }
                  />
                  <DisplayField
                    label="Phone Number"
                    value={
                      <a
                        href={`tel:${orderData.customerPhone}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {orderData.customerPhone || "---"}
                      </a>
                    }
                  />
                  <DisplayField
                    label="Email"
                    value={
                      orderData.customerEmail ? (
                        <a
                          href={`mailto:${orderData.customerEmail}`}
                          className="text-blue-600 hover:text-blue-700 font-medium break-all"
                        >
                          {orderData.customerEmail}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">---</span>
                      )
                    }
                  />
                  {orderData.customerNote && (
                    <DisplayField
                      label="Customer Note"
                      value={orderData.customerNote}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField
                    label="Payment Method"
                    value={orderData.payment?.paymentMethod || "---"}
                  />
                  <DisplayField
                    label="Payment Status"
                    value={
                      <span
                        className={
                          orderData.payment?.paymentStatus === "PAID"
                            ? "text-green-600 font-medium"
                            : "text-orange-600 font-medium"
                        }
                      >
                        {orderData.payment?.paymentStatus || "---"}
                      </span>
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            {orderData.deliveryAddress && (
              <Card className="border-green-100 bg-gradient-to-br from-green-50 to-transparent">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    📍 Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Location Photos Gallery */}
                  {locationImages && locationImages.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">Location Photos</h4>
                      <div className="relative">
                        {/* Image Carousel */}
                        <div className="relative w-full h-80 bg-gray-900 rounded-lg overflow-hidden group">
                          <img
                            src={locationImages[imageIndex]}
                            alt={`Location photo ${imageIndex + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Image Counter */}
                          <div className="absolute top-3 right-3 bg-black/60 px-3 py-1 rounded-full">
                            <span className="text-white text-xs font-medium">
                              {imageIndex + 1} / {locationImages.length}
                            </span>
                          </div>

                          {/* Navigation Buttons */}
                          {locationImages.length > 1 && (
                            <>
                              <button
                                onClick={handlePrevImage}
                                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                aria-label="Previous image"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              <button
                                onClick={handleNextImage}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                aria-label="Next image"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>

                        {/* Image Thumbnails */}
                        {locationImages.length > 1 && (
                          <div className="flex gap-2 mt-3">
                            {locationImages.map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => setImageIndex(idx)}
                                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                  idx === imageIndex
                                    ? "border-green-600"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                              >
                                <img
                                  src={img}
                                  alt={`Thumbnail ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {locationImages && locationImages.length > 0 && (
                    <div className="border-t pt-4" />
                  )}

                  {/* Delivery Address Details */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-4">Address Details</h4>
                    {/* Full Address with Google Maps Button */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-4">
                      {/* Address Field */}
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-foreground block mb-2">
                          Full Address
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm font-medium text-foreground leading-relaxed">
                            {(() => {
                              const parts = [
                                orderData.deliveryAddress.houseNumber,
                                orderData.deliveryAddress.streetNumber,
                                orderData.deliveryAddress.village,
                                orderData.deliveryAddress.commune,
                                orderData.deliveryAddress.district,
                                orderData.deliveryAddress.province,
                              ].filter(Boolean);
                              return parts.length > 0
                                ? parts.join(", ")
                                : "---";
                            })()}
                          </p>
                        </div>
                      </div>

                      {/* Address Components Grid */}
                      <DisplayField
                        label="House #"
                        value={orderData.deliveryAddress.houseNumber || "---"}
                      />
                      <DisplayField
                        label="Street"
                        value={orderData.deliveryAddress.streetNumber || "---"}
                      />
                      <DisplayField
                        label="Village"
                        value={orderData.deliveryAddress.village || "---"}
                      />
                      <DisplayField
                        label="Commune"
                        value={orderData.deliveryAddress.commune || "---"}
                      />
                      <DisplayField
                        label="District"
                        value={orderData.deliveryAddress.district || "---"}
                      />
                      <DisplayField
                        label="Province"
                        value={orderData.deliveryAddress.province || "---"}
                      />

                      {/* Coordinates and Map Button */}
                      {orderData.deliveryAddress.latitude &&
                        orderData.deliveryAddress.longitude && (
                          <div className="md:col-span-2 flex items-end justify-between gap-4">
                            <div className="text-xs text-muted-foreground">
                              <p>
                                📌 Lat:{" "}
                                {orderData.deliveryAddress.latitude.toFixed(4)}
                              </p>
                              <p>
                                📌 Lng:{" "}
                                {orderData.deliveryAddress.longitude.toFixed(4)}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                const mapsUrl = `https://www.google.com/maps?q=${orderData.deliveryAddress.latitude},${orderData.deliveryAddress.longitude}`;
                                window.open(mapsUrl, "_blank");
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm"
                            >
                              🗺️ View on Google Maps
                            </button>
                          </div>
                        )}
                    </div>

                    {/* Delivery Note */}
                    {orderData.deliveryAddress.note && (
                      <div className="border-t pt-4">
                        <DisplayField
                          label="Delivery Note"
                          value={
                            <p className="text-sm p-2 bg-blue-50 rounded border border-blue-200 text-foreground">
                              {orderData.deliveryAddress.note}
                            </p>
                          }
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delivery Option */}
            {orderData.deliveryOption && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Delivery Option</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DisplayField
                      label="Method"
                      value={orderData.deliveryOption.name || "---"}
                    />
                    <DisplayField
                      label="Price"
                      value={formatCurrency(orderData.deliveryOption.price || 0)}
                    />
                    {orderData.deliveryOption.description && (
                      <DisplayField
                        label="Description"
                        value={orderData.deliveryOption.description}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status History */}
            {orderData.statusHistory && orderData.statusHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Status History ({orderData.statusHistory.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {orderData.statusHistory.map((history, idx) => (
                    <div
                      key={history.id}
                      className="p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-muted px-2 py-1 rounded">
                            Step {idx + 1}
                          </span>
                          <span className="font-medium text-sm">
                            {history.statusName}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {dateTimeFormat(history.changedAt)}
                        </span>
                      </div>
                      {history.note && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {history.note}
                        </p>
                      )}
                      {history.changedBy && (
                        <div className="text-xs border-t pt-2 mt-2">
                          <p className="text-muted-foreground">
                            Changed by:{" "}
                            <span className="font-medium">
                              {history.changedBy.fullName ||
                                `${history.changedBy.firstName} ${history.changedBy.lastName}`}
                            </span>
                          </p>
                          {history.changedBy.phoneNumber && (
                            <p className="text-muted-foreground">
                              {history.changedBy.phoneNumber}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField
                    label="Order ID"
                    value={
                      <span className="text-xs font-mono break-all">
                        {orderData.id}
                      </span>
                    }
                  />
                  <DisplayField
                    label="Business ID"
                    value={
                      <span className="text-xs font-mono break-all">
                        {orderData.businessId}
                      </span>
                    }
                  />
                  {orderData.customerId && (
                    <DisplayField
                      label="Customer ID"
                      value={
                        <span className="text-xs font-mono break-all">
                          {orderData.customerId}
                        </span>
                      }
                    />
                  )}
                  <DisplayField
                    label="Created By"
                    value={orderData.createdBy || "---"}
                  />
                  <DisplayField
                    label="Updated By"
                    value={orderData.updatedBy || "---"}
                  />
                  {orderData.businessNote && (
                    <DisplayField
                      label="Business Note"
                      value={orderData.businessNote}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
