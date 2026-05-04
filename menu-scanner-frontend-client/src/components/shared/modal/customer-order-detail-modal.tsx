"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchOrderDetailsService } from "@/redux/features/main/store/thunks/my-orders-thunks";
import { formatCurrency } from "@/utils/common/currency-format";
import { getOrderStatusLabel } from "@/enums/order-status.enum";
import { Loading } from "@/components/shared/common/loading";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { showToast } from "@/components/shared/common/show-toast";
import { OrderResponse } from "@/redux/features/main/store/models/response/order-response";
import { useState } from "react";

interface CustomerOrderDetailModalProps {
  orderId?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface OrderDetailState {
  order: OrderResponse | null;
  loading: boolean;
  error: string | null;
}

export function CustomerOrderDetailModal({
  orderId,
  isOpen,
  onClose,
}: CustomerOrderDetailModalProps) {
  const dispatch = useAppDispatch();
  const [state, setState] = useState<OrderDetailState>({
    order: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!orderId || !isOpen) return;

    const fetchOrderDetails = async () => {
      try {
        setState({ order: null, loading: true, error: null });
        const result = await dispatch(fetchOrderDetailsService(orderId)).unwrap();
        setState({ order: result, loading: false, error: null });
      } catch (error: any) {
        setState({
          order: null,
          loading: false,
          error: error?.message || "Failed to load order details",
        });
      }
    };

    fetchOrderDetails();
  }, [orderId, isOpen, dispatch]);

  const handleClose = () => {
    setState({ order: null, loading: false, error: null });
    onClose();
  };

  if (state.loading) {
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

  if (!state.order) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">Order Details</DialogTitle>
        <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground">
                {state.error
                  ? `Error: ${state.error}`
                  : "No order data available"}
              </p>
              {state.error && (
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

  const orderData = state.order;

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
            <p className="text-sm text-muted-foreground mt-1">
              {orderData.orderNumber}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Order & Pricing Information */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/30">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-bold text-foreground">📋 Order & Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Order Details */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Order Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <DisplayField
                      label="Order Number"
                      value={orderData.orderNumber}
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
                      label="Payment Method"
                      value={orderData.payment?.paymentMethod || "---"}
                    />
                    <DisplayField
                      label="Payment Status"
                      value={
                        <span
                          className={
                            orderData.payment?.paymentStatus === "PAID"
                              ? "text-green-600 dark:text-green-400 font-medium"
                              : "text-orange-600 dark:text-orange-400 font-medium"
                          }
                        >
                          {orderData.payment?.paymentStatus || "---"}
                        </span>
                      }
                    />
                    <DisplayField
                      label="Customer Name"
                      value={
                        <span className="font-semibold text-foreground">
                          {orderData.customerName || "Customer"}
                        </span>
                      }
                    />
                    <DisplayField
                      label="Phone Number"
                      value={
                        <a
                          href={`tel:${orderData.customerPhone}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                        >
                          {orderData.customerPhone || "---"}
                        </a>
                      }
                    />
                    {orderData.customerEmail && (
                      <DisplayField
                        label="Email"
                        value={
                          <a
                            href={`mailto:${orderData.customerEmail}`}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium break-all"
                          >
                            {orderData.customerEmail}
                          </a>
                        }
                      />
                    )}
                    {orderData.customerNote && (
                      <DisplayField
                        label="Customer Note"
                        value={orderData.customerNote}
                      />
                    )}
                  </div>
                </div>

                {/* Pricing Details */}
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
                  <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-3">💰 Pricing Details</h4>
                  <div className="space-y-3">
                    {/* Before Snapshot */}
                    {(() => {
                      const before = orderData.pricing?.before;
                      return (
                        <div className="bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-900 rounded p-3 space-y-2">
                          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 font-bold mb-2">📌 Pricing</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <DisplayField
                              label="Items"
                              value={String(before?.totalItems || 0)}
                            />
                            <DisplayField
                              label="Subtotal"
                              value={formatCurrency(before?.subtotal || 0)}
                            />
                            {(before?.discountAmount ?? 0) > 0 && (
                              <DisplayField
                                label="Discount"
                                value={
                                  <span className="text-red-600 dark:text-red-400 font-semibold">
                                    -{formatCurrency(before!.discountAmount)}
                                  </span>
                                }
                              />
                            )}
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
                                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                  {formatCurrency(before?.finalTotal || 0)}
                                </span>
                              }
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            {orderData.items && orderData.items.length > 0 && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/30">
                <CardHeader className="pb-4 border-b">
                  <CardTitle className="text-lg font-bold text-foreground">
                    🛒 Order Items ({orderData.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {orderData.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 border border-border/50 rounded-lg bg-card"
                    >
                      {/* Product Image and Header */}
                      <div className="mb-3">
                        <div className="flex items-start gap-3">
                          {/* Product Image */}
                          {item.product?.imageUrl && (
                            <div className="flex-shrink-0 rounded-lg overflow-hidden border border-border">
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-16 h-16 object-cover"
                              />
                            </div>
                          )}
                          {/* Product Name and Details */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-sm">
                                #{idx + 1} - {item.product?.name || "Unknown"}
                              </h4>
                              {(item.before?.discountAmount ?? 0) > 0 && (
                                <span className="text-xs px-2 py-1 bg-red-600 dark:bg-red-700 text-white rounded whitespace-nowrap">
                                  💰 Discounted
                                </span>
                              )}
                            </div>
                            {/* Size and SKU */}
                            {item.product?.sizeName && (
                              <div className="text-xs text-muted-foreground">
                                Size: <span className="font-medium">{item.product.sizeName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Item Pricing */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">Quantity:</span>
                            <p className="font-medium">{item.before?.quantity || 0}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Unit Price:</span>
                            <p className="font-medium">
                              {formatCurrency(item.before?.finalPrice || 0)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Subtotal:</span>
                            <p className="font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(item.before?.totalPrice || 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Delivery Information */}
            {orderData.deliveryAddress && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/30">
                <CardHeader className="pb-4 border-b">
                  <CardTitle className="text-lg font-bold text-foreground">📍 Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {/* Delivery Details */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                    <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-3">📫 Address & Delivery</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DisplayField
                        label="Full Address"
                        value={
                          <span className="text-sm">
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
                          </span>
                        }
                      />
                      {orderData.deliveryOption && (
                        <>
                          <DisplayField
                            label="Delivery Method"
                            value={orderData.deliveryOption.name || "---"}
                          />
                          <DisplayField
                            label="Delivery Fee"
                            value={formatCurrency(orderData.deliveryOption.price || 0)}
                          />
                        </>
                      )}
                      {orderData.deliveryAddress.note && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                            Delivery Note
                          </label>
                          <p className="text-sm text-foreground">
                            {orderData.deliveryAddress.note}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status History */}
            {orderData.statusHistory && orderData.statusHistory.length > 0 && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-foreground">
                    📈 Status History ({orderData.statusHistory.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {orderData.statusHistory.map((history, idx) => (
                    <div
                      key={history.id}
                      className="text-sm border border-border rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground">
                            Step {idx + 1}
                          </span>
                          <span className="font-semibold text-sm text-foreground">
                            {history.statusName}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {dateTimeFormat(history.changedAt)}
                        </span>
                      </div>
                      {history.note && (
                        <p className="text-xs text-muted-foreground mb-2 ml-1">
                          {history.note}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
