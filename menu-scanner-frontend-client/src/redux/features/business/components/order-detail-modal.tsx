"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  DetailRow,
  DetailSection,
} from "@/components/shared/modal/detail-section";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectOrderAdminIsFetchingDetail,
  selectSelectedOrder,
} from "../store/selectors/order-admin-selector";
import { fetchOrderByIdAdminService } from "../store/thunks/order-admin-thunks";
import { clearSelectedOrder } from "../store/slice/order-admin-slice";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/common/currency-format";
import { getOrderStatusLabel } from "@/enums/order-status.enum";

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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "READY":
        return "default" as const;
      case "CANCELLED":
      case "FAILED":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title="Order Details"
      description={
        orderData
          ? `Order #${orderData.orderNumber}`
          : "Loading order information..."
      }
    >
      {orderData ? (
        <div className="space-y-6">
          {/* Order Information */}
          <DetailSection title="Order Information">
            <DetailRow
              label="Order Number"
              value={
                <span className="font-mono font-medium text-base">
                  {orderData.orderNumber}
                </span>
              }
            />
            <DetailRow
              label="Order Type"
              value={
                <span className="text-sm font-medium">
                  {orderData.orderFrom === "CUSTOMER" ? "🛒 Customer (Public)" : "🏪 Business (POS)"}
                </span>
              }
            />
            <DetailRow
              label="Status"
              value={
                <span className={`text-sm font-medium ${
                  orderData.orderStatus === "COMPLETED" || orderData.orderStatus === "READY"
                    ? "text-green-600"
                    : orderData.orderStatus === "CANCELLED" || orderData.orderStatus === "FAILED"
                    ? "text-red-600"
                    : "text-blue-600"
                }`}>
                  {getOrderStatusLabel(orderData.orderStatus)}
                </span>
              }
            />
            <DetailRow
              label="Created"
              value={dateTimeFormat(orderData.createdAt)}
            />
            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(orderData.updatedAt)}
              isLast={!orderData.customerNote && !orderData.businessNote}
            />
            {orderData.businessNote && (
              <DetailRow
                label="Business Note"
                value={orderData.businessNote}
              />
            )}
          </DetailSection>

          {/* Customer Information */}
          <DetailSection title="Customer Information">
            <DetailRow
              label="Customer Name"
              value={orderData.customerName || "---"}
            />
            <DetailRow
              label="Phone"
              value={orderData.customerPhone || "---"}
            />
            {orderData.customerNote && (
              <DetailRow label="Customer Note" value={orderData.customerNote} />
            )}
          </DetailSection>

          {/* Pricing Information */}
          <DetailSection title="Pricing Information">
            {(() => {
              const before = orderData.pricing?.before;
              const after = orderData.pricing?.after;
              const current = after ?? before;
              const hasOrderLevelChange = orderData.pricing?.hadOrderLevelChangeFromPOS && before && after;

              return (
                <>
                  <DetailRow
                    label="Total Items"
                    value={String(current?.totalItems || 0)}
                  />

                  {/* Before Pricing (if changed) */}
                  {hasOrderLevelChange && before && (
                    <div className="border rounded-lg p-3 bg-gray-50 my-2">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Original Pricing:</p>
                      <DetailRow
                        label="Subtotal (Before Discount)"
                        value={formatCurrency(before.subtotalBeforeDiscount || 0)}
                      />
                      {(before.totalDiscount ?? 0) > 0 && (
                        <DetailRow
                          label="Discount"
                          value={
                            <span className="text-red-500">
                              -{formatCurrency(before.totalDiscount)}
                            </span>
                          }
                        />
                      )}
                      <DetailRow
                        label="Subtotal"
                        value={formatCurrency(before.subtotal || 0)}
                      />
                      <DetailRow
                        label="Delivery Fee"
                        value={formatCurrency(before.deliveryFee || 0)}
                      />
                      {(before.taxAmount ?? 0) > 0 && (
                        <DetailRow
                          label="Tax"
                          value={formatCurrency(before.taxAmount)}
                        />
                      )}
                      <DetailRow
                        label="Original Total"
                        value={
                          <span className="font-semibold text-base line-through">
                            {formatCurrency(before.finalTotal || 0)}
                          </span>
                        }
                        isLast
                      />
                    </div>
                  )}

                  {/* Current/After Pricing */}
                  <DetailRow
                    label="Subtotal (Before Discount)"
                    value={formatCurrency(current?.subtotalBeforeDiscount || 0)}
                  />
                  {(current?.totalDiscount ?? 0) > 0 && (
                    <DetailRow
                      label="Discount"
                      value={
                        <span className="text-red-500">
                          -{formatCurrency(current!.totalDiscount)}
                        </span>
                      }
                    />
                  )}
                  <DetailRow
                    label="Subtotal"
                    value={formatCurrency(current?.subtotal || 0)}
                  />
                  <DetailRow
                    label="Delivery Fee"
                    value={formatCurrency(current?.deliveryFee || 0)}
                  />
                  {(current?.taxAmount ?? 0) > 0 && (
                    <DetailRow
                      label="Tax"
                      value={formatCurrency(current!.taxAmount)}
                    />
                  )}
                  <DetailRow
                    label="Final Total"
                    value={
                      <span className={`text-lg font-bold ${hasOrderLevelChange ? "text-green-600" : "text-green-600"}`}>
                        {formatCurrency(current?.finalTotal || 0)}
                      </span>
                    }
                  />

                  {hasOrderLevelChange && orderData.pricing?.reason && (
                    <div className="border rounded-lg p-3 bg-orange-50 border-orange-200 my-2">
                      <p className="text-xs font-semibold text-orange-900">
                        Reason for Change:
                      </p>
                      <p className="text-sm text-orange-800 mt-1">
                        {orderData.pricing.reason}
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </DetailSection>

          {/* Payment Information */}
          <DetailSection title="Payment">
            <DetailRow
              label="Payment Method"
              value={orderData.payment?.paymentMethod || "---"}
            />
            <DetailRow
              label="Payment Status"
              value={
                <span className={`text-sm font-medium ${
                  orderData.payment?.paymentStatus === "PAID"
                    ? "text-green-600"
                    : orderData.payment?.paymentStatus === "PENDING" || orderData.payment?.paymentStatus === "UNPAID"
                    ? "text-orange-600"
                    : "text-red-600"
                }`}>
                  {orderData.payment?.paymentStatus || "---"}
                </span>
              }
              isLast
            />
          </DetailSection>

          {/* Delivery Information */}
          {orderData.deliveryAddress && (
            <DetailSection title="Delivery Address">
              <DetailRow
                label="Province"
                value={orderData.deliveryAddress.province || "---"}
              />
              <DetailRow
                label="District"
                value={orderData.deliveryAddress.district || "---"}
              />
              <DetailRow
                label="Commune"
                value={orderData.deliveryAddress.commune || "---"}
              />
              <DetailRow
                label="Village"
                value={orderData.deliveryAddress.village || "---"}
              />
              {orderData.deliveryAddress.streetNumber && (
                <DetailRow
                  label="Street"
                  value={orderData.deliveryAddress.streetNumber}
                />
              )}
              {orderData.deliveryAddress.note && (
                <DetailRow
                  label="Note"
                  value={orderData.deliveryAddress.note}
                />
              )}
            </DetailSection>
          )}

          {orderData.deliveryOption && (
            <DetailSection title="Delivery Option">
              <DetailRow
                label="Name"
                value={orderData.deliveryOption.name || "---"}
              />
              <DetailRow
                label="Price"
                value={formatCurrency(orderData.deliveryOption.price || 0)}
              />
            </DetailSection>
          )}

          {/* Order Items */}
          {orderData.items && orderData.items.length > 0 && (
            <DetailSection title={`Order Items (${orderData.items.length} items)`}>
              <div className="space-y-4">
                {orderData.items.map((item, idx) => {
                  const before = item.before;
                  const after = item.after;
                  const current = after ?? before;
                  const hasChange = item.hadChangeFromPOS && after;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 border rounded-lg ${
                        hasChange
                          ? "bg-orange-50 border-orange-200"
                          : "bg-muted/50"
                      }`}
                    >
                      {/* Item Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground">
                              #{idx + 1}
                            </span>
                            <h4 className="font-semibold text-sm">
                              {item.product?.name || "Unknown Product"}
                            </h4>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.product?.sizeName && (
                              <>Size: <span className="font-medium">{item.product.sizeName}</span></>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasChange && (
                            <Badge className="bg-orange-600 text-white text-[10px]">
                              Modified
                            </Badge>
                          )}
                          {current?.hasActivePromotion && (
                            <Badge variant="outline" className="text-[10px] text-green-600 border-green-300">
                              Promo
                            </Badge>
                          )}
                          <span className="text-sm font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            ×{current?.quantity ?? 0}
                          </span>
                        </div>
                      </div>

                      {/* Pricing Details */}
                      <div className="space-y-2">
                        {/* Before Pricing (if changed) */}
                        {hasChange && before && (
                          <div className="text-xs bg-white p-2 rounded border border-dashed">
                            <div className="text-muted-foreground font-medium mb-1">Before:</div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <span className="text-muted-foreground">Price: </span>
                                <span className="line-through">
                                  {formatCurrency(before.finalPrice)}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Qty: </span>
                                <span className="line-through">{before.quantity}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Total: </span>
                                <span className="line-through font-medium">
                                  {formatCurrency(before.totalPrice)}
                                </span>
                              </div>
                              {before.discountAmount > 0 && (
                                <div className="col-span-3">
                                  <span className="text-red-500">
                                    Discount: -{formatCurrency(before.discountAmount)}
                                  </span>
                                </div>
                              )}
                              {before.hasActivePromotion && (
                                <div className="col-span-3 text-green-600">
                                  {before.promotionType}: {before.promotionValue}
                                  {before.promotionType === "PERCENTAGE" ? "%" : ""}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* After/Current Pricing */}
                        <div className="text-xs bg-white p-2 rounded">
                          <div className="text-muted-foreground font-medium mb-1">
                            {hasChange ? "After:" : "Price:"}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <span className="text-muted-foreground">Price: </span>
                              <span className={hasChange ? "font-bold text-green-600" : ""}>
                                {formatCurrency(current?.finalPrice ?? 0)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Qty: </span>
                              <span>{current?.quantity ?? 0}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total: </span>
                              <span className={`font-bold ${hasChange ? "text-green-600" : ""}`}>
                                {formatCurrency(current?.totalPrice ?? 0)}
                              </span>
                            </div>
                            {(current?.discountAmount ?? 0) > 0 && (
                              <div className="col-span-3">
                                <span className="text-red-500">
                                  Discount: -{formatCurrency(current!.discountAmount)}
                                </span>
                              </div>
                            )}
                            {current?.hasActivePromotion && (
                              <div className="col-span-3 text-green-600">
                                {current.promotionType}: {current.promotionValue}
                                {current.promotionType === "PERCENTAGE" ? "%" : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Change Reason */}
                      {hasChange && item.reason && (
                        <div className="mt-2 text-xs p-2 bg-orange-100 rounded border border-orange-200">
                          <span className="font-medium text-orange-900">Reason: </span>
                          <span className="text-orange-800">{item.reason}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </DetailSection>
          )}

          {/* Status History */}
          {orderData.statusHistory && orderData.statusHistory.length > 0 && (
            <DetailSection title={`Status History (${orderData.statusHistory.length} changes)`}>
              <div className="space-y-3">
                {orderData.statusHistory.map((history, idx) => (
                  <div
                    key={history.id}
                    className="p-3 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
                          Step {idx + 1}
                        </span>
                        <Badge variant="outline">
                          {history.statusName}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {dateTimeFormat(history.changedAt)}
                      </span>
                    </div>
                    {history.note && (
                      <p className="text-xs text-muted-foreground mb-2">
                        📝 {history.note}
                      </p>
                    )}
                    {history.changedBy && (
                      <div className="text-xs bg-white p-2 rounded border border-dashed">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-muted-foreground">Changed by: </span>
                            <span className="font-medium">
                              {history.changedBy.fullName || `${history.changedBy.firstName} ${history.changedBy.lastName}`}
                            </span>
                          </div>
                          {history.changedBy.phoneNumber && (
                            <span className="text-muted-foreground">
                              {history.changedBy.phoneNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Business & System Info */}
          <DetailSection title="System & Business Information">
            <DetailRow
              label="Order ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {orderData.id}
                </span>
              }
            />
            <DetailRow
              label="Business ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {orderData.businessId}
                </span>
              }
            />
            <DetailRow
              label="Business"
              value={orderData.businessName || "---"}
            />
            {orderData.customerId && (
              <DetailRow
                label="Customer ID"
                value={
                  <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                    {orderData.customerId}
                  </span>
                }
              />
            )}
            <DetailRow
              label="Created By"
              value={orderData.createdBy || "---"}
            />
            <DetailRow
              label="Updated By"
              value={orderData.updatedBy || "---"}
              isLast
            />
          </DetailSection>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No order data available</p>
        </div>
      )}
    </DetailModal>
  );
}
