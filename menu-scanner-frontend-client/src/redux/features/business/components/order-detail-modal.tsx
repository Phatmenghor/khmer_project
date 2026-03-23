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
                <span className="font-mono font-medium">
                  {orderData.orderNumber}
                </span>
              }
            />
            <DetailRow
              label="Status"
              value={
                <Badge variant={getStatusVariant(orderData.orderStatus)}>
                  {getOrderStatusLabel(orderData.orderStatus)}
                </Badge>
              }
            />
            <DetailRow
              label="Created At"
              value={dateTimeFormat(orderData.createdAt)}
            />
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
          <DetailSection title="Pricing">
            <DetailRow
              label="Total Items"
              value={String(orderData.pricing?.totalItems || 0)}
            />
            <DetailRow
              label="Subtotal (Before Discount)"
              value={formatCurrency(
                orderData.pricing?.subtotalBeforeDiscount || 0
              )}
            />
            {(orderData.pricing?.totalDiscount ?? 0) > 0 && (
              <DetailRow
                label="Discount"
                value={
                  <span className="text-red-500">
                    -{formatCurrency(orderData.pricing.totalDiscount)}
                  </span>
                }
              />
            )}
            <DetailRow
              label="Subtotal"
              value={formatCurrency(orderData.pricing?.subtotal || 0)}
            />
            <DetailRow
              label="Delivery Fee"
              value={formatCurrency(orderData.pricing?.deliveryFee || 0)}
            />
            {(orderData.pricing?.taxAmount ?? 0) > 0 && (
              <DetailRow
                label="Tax"
                value={formatCurrency(orderData.pricing.taxAmount)}
              />
            )}
            <DetailRow
              label="Final Total"
              value={
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(orderData.pricing?.finalTotal || 0)}
                </span>
              }
            />
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
                <Badge
                  variant={
                    orderData.payment?.paymentStatus === "PAID"
                      ? "default"
                      : "secondary"
                  }
                >
                  {orderData.payment?.paymentStatus || "---"}
                </Badge>
              }
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
            <DetailSection title="Order Items">
              <div className="space-y-3">
                {orderData.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border rounded-lg bg-muted/50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-sm">
                          {item.product?.name || "Unknown Product"}
                        </h4>
                        {item.product?.sizeName && (
                          <span className="text-xs text-muted-foreground">
                            Size: {item.product.sizeName}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        x{item.quantity}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Price: </span>
                        <span>{formatCurrency(item.currentPrice)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total: </span>
                        <span className="font-medium">
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </div>
                      {item.hasActivePromotion && (
                        <div>
                          <span className="text-muted-foreground">
                            Discount:{" "}
                          </span>
                          <span className="text-red-500">
                            -{formatCurrency(item.discountAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Status History */}
          {orderData.statusHistory && orderData.statusHistory.length > 0 && (
            <DetailSection title="Status History">
              <div className="space-y-2">
                {orderData.statusHistory.map((history) => (
                  <div
                    key={history.id}
                    className="flex items-center justify-between p-2 border rounded text-xs"
                  >
                    <div>
                      <Badge variant="outline" className="mr-2">
                        {history.statusName}
                      </Badge>
                      {history.note && (
                        <span className="text-muted-foreground">
                          {history.note}
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground whitespace-nowrap">
                      {dateTimeFormat(history.changedAt)}
                    </span>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Business & System Info */}
          <DetailSection title="System Information">
            <DetailRow
              label="Order ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {orderData.id}
                </span>
              }
            />
            <DetailRow
              label="Business"
              value={orderData.businessName || "---"}
            />
            {orderData.businessNote && (
              <DetailRow
                label="Business Note"
                value={orderData.businessNote}
              />
            )}
            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(orderData.updatedAt ?? "")}
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
