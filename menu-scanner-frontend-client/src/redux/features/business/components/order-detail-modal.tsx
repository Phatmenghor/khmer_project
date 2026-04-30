"use client";

import { useEffect } from "react";
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
import { showToast } from "@/components/shared/common/show-toast";

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
                      label="Order Type"
                      value={
                        orderData.orderFrom === "CUSTOMER"
                          ? "Customer (Public)"
                          : "Business (POS)"
                      }
                    />
                    <DisplayField
                      label="Created At"
                      value={dateTimeFormat(orderData.createdAt)}
                    />
                    <DisplayField
                      label="Business"
                      value={orderData.businessName || "---"}
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
                              ? "text-green-600 font-medium"
                              : "text-orange-600 font-medium"
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
                    {orderData.customerEmail && (
                      <DisplayField
                        label="Email"
                        value={
                          <a
                            href={`mailto:${orderData.customerEmail}`}
                            className="text-blue-600 hover:text-blue-700 font-medium break-all"
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
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">💰 Pricing Breakdown</h4>
                  <div className="space-y-3">
                    <div className="bg-white border border-amber-100 rounded p-3 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <DisplayField
                          label="Items"
                          value={String(orderData.pricing?.totalItems || 0)}
                        />
                        <DisplayField
                          label="Subtotal"
                          value={
                            <span className="font-semibold">
                              {formatCurrency(orderData.pricing?.subtotal || 0)}
                            </span>
                          }
                        />
                        {(orderData.pricing?.customizationTotal ?? 0) > 0 && (
                          <DisplayField
                            label="Customizations/Add-ons"
                            value={
                              <span className="text-blue-600 font-semibold">
                                +{formatCurrency(orderData.pricing!.customizationTotal)}
                              </span>
                            }
                          />
                        )}
                        <DisplayField
                          label="Delivery Fee"
                          value={formatCurrency(orderData.pricing?.deliveryFee || 0)}
                        />
                        {(orderData.pricing?.taxPercentage ?? 0) > 0 && (
                          <>
                            <DisplayField
                              label={`Tax (${orderData.pricing?.taxPercentage}%)`}
                              value={
                                <span className="text-green-600 font-semibold">
                                  +{formatCurrency(orderData.pricing?.taxAmount || 0)}
                                </span>
                              }
                            />
                          </>
                        )}
                        {(orderData.pricing?.discountAmount ?? 0) > 0 && (
                          <>
                            <DisplayField
                              label="Discount"
                              value={
                                <span className="text-red-600 font-semibold">
                                  -{formatCurrency(orderData.pricing!.discountAmount)}
                                </span>
                              }
                            />
                            {orderData.pricing?.discountType && (
                              <DisplayField
                                label="Discount Type"
                                value={
                                  <span className="font-medium text-orange-600">
                                    {orderData.pricing.discountType === "percentage" ? "Percentage" : "Fixed Amount"}
                                  </span>
                                }
                              />
                            )}
                            {orderData.pricing?.discountReason && (
                              <div className="md:col-span-2">
                                <DisplayField
                                  label="Discount Reason"
                                  value={orderData.pricing.discountReason}
                                />
                              </div>
                            )}
                          </>
                        )}
                        <div className="md:col-span-2 border-t pt-2 mt-2">
                          <DisplayField
                            label="Final Total"
                            value={
                              <span className="text-lg font-bold text-green-600">
                                {formatCurrency(orderData.pricing?.finalTotal || 0)}
                              </span>
                            }
                          />
                        </div>
                      </div>
                    </div>
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
                <CardContent className="space-y-4 pt-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-4">Items List</h4>
                  {orderData.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 border rounded-lg bg-gray-50 border-gray-200"
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
                          {/* Product Name and Details */}
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">
                              #{idx + 1} - {item.product?.name || "Unknown"}
                            </h4>
                            {/* Size, SKU, and Barcode */}
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                              {item.product?.sizeName && (
                                <span>Size: <span className="font-medium">{item.product.sizeName}</span></span>
                              )}
                              {item.product?.sku && (
                                <span>SKU: <span className="font-mono font-medium text-foreground">{item.product.sku}</span></span>
                              )}
                              {item.product?.barcode && (
                                <span>Barcode: <span className="font-mono font-medium text-foreground">{item.product.barcode}</span></span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Item Pricing */}
                      <div className="space-y-2">
                        {/* Qty and Promotion Row */}
                        <div className="flex items-start justify-between gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Qty:</span>
                            <p className="font-medium">{item.quantity}</p>
                          </div>
                          {item.hasPromotion && (
                            <div className="text-right">
                              <p className="font-bold text-orange-600">
                                {item.promotionType === "PERCENTAGE" ? `${item.promotionValue}%` : formatCurrency(item.promotionValue || 0)}
                              </p>
                              <p className="text-orange-600 font-semibold">
                                -{formatCurrency((item.currentPrice || 0) - (item.finalPrice || 0))}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Original Price Row */}
                        {item.hasPromotion && item.currentPrice && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Original Price:</span>
                            <p className="font-medium line-through text-orange-500">{formatCurrency(item.currentPrice)}</p>
                          </div>
                        )}

                        {/* Unit Price Row */}
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Unit Price:</span>
                          <p className="font-medium">{formatCurrency(item.finalPrice)}</p>
                        </div>

                        {/* Item Total Row */}
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Item Total:</span>
                          <p className="font-bold text-green-600">{formatCurrency(item.totalPrice)}</p>
                        </div>

                        {/* Add-ons Row */}
                        {(item.customizationTotal ?? 0) > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Add-ons:</span>
                            <p className="font-medium text-blue-600">+{formatCurrency(item.customizationTotal)}</p>
                          </div>
                        )}
                      </div>

                      {/* Customizations if any */}
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                          <h5 className="text-xs font-bold text-blue-700 uppercase mb-2">✨ Add-ons / Customizations</h5>
                          <div className="space-y-1">
                            {item.customizations.map((custom) => (
                              <div key={custom.productCustomizationId} className="flex justify-between text-xs">
                                <span className="text-foreground">{custom.name}</span>
                                <span className="text-blue-600 font-semibold">+{formatCurrency(custom.priceAdjustment)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  </div>
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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">Address & Delivery</h4>
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
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm text-foreground flex-1">
                              {orderData.deliveryAddress.note}
                            </p>
                            <div className="flex gap-1 flex-shrink-0">
                              {/* Copy Button */}
                              <button
                                onClick={() => {
                                  const fullAddress = [
                                    orderData.deliveryAddress.houseNumber,
                                    orderData.deliveryAddress.streetNumber,
                                    orderData.deliveryAddress.village,
                                    orderData.deliveryAddress.commune,
                                    orderData.deliveryAddress.district,
                                    orderData.deliveryAddress.province,
                                  ]
                                    .filter(Boolean)
                                    .join(", ");
                                  navigator.clipboard.writeText(
                                    `${fullAddress}\n\nDelivery Note: ${orderData.deliveryAddress.note}`
                                  );
                                  showToast.success("✅ Address copied!");
                                }}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 p-2 rounded transition-colors font-semibold"
                                title="Copy address and note"
                              >
                                📋 Copy
                              </button>
                              {/* View Google Maps Button */}
                              {orderData.deliveryAddress.latitude &&
                                orderData.deliveryAddress.longitude && (
                                  <button
                                    onClick={() => {
                                      const mapsUrl = `https://www.google.com/maps?q=${orderData.deliveryAddress.latitude},${orderData.deliveryAddress.longitude}`;
                                      window.open(mapsUrl, "_blank");
                                    }}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 p-2 rounded transition-colors font-semibold"
                                    title="View on Google Maps"
                                  >
                                    🗺️ Map
                                  </button>
                                )}
                            </div>
                          </div>
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
                <CardHeader className="pb-4 border-b">
                  <CardTitle className="text-lg font-bold text-foreground">
                    📈 Status History ({orderData.statusHistory.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-3">
                    {orderData.statusHistory.map((history, idx) => (
                      <div
                        key={history.id}
                        className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-slate-300"
                      >
                        {/* Status Badge and Timestamp */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-sm font-semibold text-foreground">
                              {history.statusName || getOrderStatusLabel(history.orderStatus)}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">
                            {dateTimeFormat(history.changedAt || history.createdAt)}
                          </span>
                        </div>

                        {/* Note */}
                        {history.note && (
                          <p className="text-sm text-slate-600 border-l-3 border-blue-500 pl-3 mb-0">
                            {history.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* System Information */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/30">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-bold text-foreground">⚙️ System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Metadata</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                      <div className="md:col-span-2">
                        <DisplayField
                          label="Business Note"
                          value={orderData.businessNote}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
