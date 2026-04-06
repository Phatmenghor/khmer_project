"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectOrderAdminIsFetchingDetail,
  selectSelectedOrder,
} from "../store/selectors/order-admin-selector";
import { fetchOrderByIdAdminService } from "../store/thunks/order-admin-thunks";
import { clearSelectedOrder } from "../store/slice/order-admin-slice";
import { formatCurrency } from "@/utils/common/currency-format";
import { getOrderStatusLabel } from "@/enums/order-status.enum";
import { Loading } from "@/components/shared/common/loading";
import { DisplayField } from "@/components/shared/form-field/display-field";

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

  useEffect(() => {
    if (!orderId || !isOpen) return;
    dispatch(fetchOrderByIdAdminService(orderId));
  }, [orderId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedOrder());
    onClose();
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
            <p className="text-muted-foreground">No order data available</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(() => {
                      const before = orderData.pricing?.before;
                      const after = orderData.pricing?.after;
                      const current = after ?? before;

                      return (
                        <>
                          <DisplayField
                            label="Total Items"
                            value={String(current?.totalItems || 0)}
                          />
                          <DisplayField
                            label="Subtotal (Before Discount)"
                            value={formatCurrency(
                              current?.subtotalBeforeDiscount || 0
                            )}
                          />
                          {(current?.totalDiscount ?? 0) > 0 && (
                            <DisplayField
                              label="Discount"
                              value={
                                <span className="text-red-600">
                                  -{formatCurrency(current!.totalDiscount)}
                                </span>
                              }
                            />
                          )}
                          <DisplayField
                            label="Subtotal"
                            value={formatCurrency(current?.subtotal || 0)}
                          />
                          <DisplayField
                            label="Delivery Fee"
                            value={formatCurrency(current?.deliveryFee || 0)}
                          />
                          {(current?.taxAmount ?? 0) > 0 && (
                            <DisplayField
                              label="Tax"
                              value={formatCurrency(current!.taxAmount)}
                            />
                          )}
                          <DisplayField
                            label="Final Total"
                            value={
                              <span className="text-lg font-bold text-green-600">
                                {formatCurrency(current?.finalTotal || 0)}
                              </span>
                            }
                          />
                          {orderData.pricing?.hadOrderLevelChangeFromPOS &&
                            before && (
                              <DisplayField
                                label="Original Total"
                                value={
                                  <span className="line-through text-muted-foreground">
                                    {formatCurrency(before.finalTotal || 0)}
                                  </span>
                                }
                              />
                            )}
                          {orderData.pricing?.reason && (
                            <DisplayField
                              label="Change Reason"
                              value={orderData.pricing.reason}
                            />
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField
                    label="Customer Name"
                    value={orderData.customerName || "Walk-in"}
                  />
                  <DisplayField
                    label="Phone Number"
                    value={orderData.customerPhone || "---"}
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Delivery Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DisplayField
                      label="Province"
                      value={orderData.deliveryAddress.province || "---"}
                    />
                    <DisplayField
                      label="District"
                      value={orderData.deliveryAddress.district || "---"}
                    />
                    <DisplayField
                      label="Commune"
                      value={orderData.deliveryAddress.commune || "---"}
                    />
                    <DisplayField
                      label="Village"
                      value={orderData.deliveryAddress.village || "---"}
                    />
                    {orderData.deliveryAddress.streetNumber && (
                      <DisplayField
                        label="Street Number"
                        value={orderData.deliveryAddress.streetNumber}
                      />
                    )}
                    {orderData.deliveryAddress.houseNumber && (
                      <DisplayField
                        label="House Number"
                        value={orderData.deliveryAddress.houseNumber}
                      />
                    )}
                    {orderData.deliveryAddress.note && (
                      <DisplayField
                        label="Delivery Note"
                        value={orderData.deliveryAddress.note}
                      />
                    )}
                    {orderData.deliveryAddress.latitude && (
                      <DisplayField
                        label="Latitude"
                        value={orderData.deliveryAddress.latitude}
                      />
                    )}
                    {orderData.deliveryAddress.longitude && (
                      <DisplayField
                        label="Longitude"
                        value={orderData.deliveryAddress.longitude}
                      />
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
                    const current = after ?? before;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 border rounded-lg ${
                          item.hadChangeFromPOS
                            ? "bg-orange-50 border-orange-200"
                            : "bg-gray-50"
                        }`}
                      >
                        <div className="mb-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">
                              #{idx + 1} - {item.product?.name || "Unknown"}
                            </h4>
                            {item.hadChangeFromPOS && (
                              <span className="text-xs px-2 py-1 bg-orange-600 text-white rounded">
                                Modified
                              </span>
                            )}
                          </div>
                          {item.product?.sizeName && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Size: {item.product.sizeName}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
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
                          {current?.hasActivePromotion && (
                            <div>
                              <span className="text-muted-foreground">
                                Promo:
                              </span>
                              <p className="font-medium text-green-600">
                                {current.promotionType}: {current.promotionValue}
                                {current.promotionType === "PERCENTAGE"
                                  ? "%"
                                  : ""}
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
