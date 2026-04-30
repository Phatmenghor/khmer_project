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
            {/* Order Progress Tracker */}
            {orderData.statusHistory && orderData.statusHistory.length > 0 && (
              <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-foreground">📊 Order Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Progress Timeline */}
                  <div className="space-y-4">
                    {/* Visual Timeline */}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-center flex-1">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                            ['PENDING', 'CONFIRMED', 'COMPLETED'].includes(orderData.orderStatus)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-300 text-white'
                          }`}>
                            ✓
                          </div>
                          <p className="text-xs font-semibold mt-2 text-foreground">Received</p>
                        </div>

                        {/* Connector Line */}
                        <div className={`flex-1 h-1 mx-2 ${
                          ['CONFIRMED', 'COMPLETED'].includes(orderData.orderStatus)
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`}></div>

                        <div className="text-center flex-1">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                            ['CONFIRMED', 'COMPLETED'].includes(orderData.orderStatus)
                              ? 'bg-green-500 text-white'
                              : orderData.orderStatus === 'PENDING'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}>
                            {['CONFIRMED', 'COMPLETED'].includes(orderData.orderStatus) ? '✓' :
                             orderData.orderStatus === 'PENDING' ? '⏳' : '✕'}
                          </div>
                          <p className="text-xs font-semibold mt-2 text-foreground">Processing</p>
                        </div>

                        {/* Connector Line */}
                        <div className={`flex-1 h-1 mx-2 ${
                          orderData.orderStatus === 'COMPLETED'
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`}></div>

                        <div className="text-center flex-1">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                            orderData.orderStatus === 'COMPLETED'
                              ? 'bg-green-500 text-white'
                              : orderData.orderStatus === 'CANCELLED'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-300 text-white'
                          }`}>
                            {orderData.orderStatus === 'COMPLETED' ? '✓' :
                             orderData.orderStatus === 'CANCELLED' ? '✕' : '○'}
                          </div>
                          <p className="text-xs font-semibold mt-2 text-foreground">Completed</p>
                        </div>
                      </div>

                      {/* Current Status Badge */}
                      <div className="mt-4 p-3 bg-white border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Status</p>
                            <p className="text-sm font-bold text-foreground mt-1">{getOrderStatusLabel(orderData.orderStatus)}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                            orderData.orderStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            orderData.orderStatus === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                            orderData.orderStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {orderData.orderStatus}
                          </div>
                        </div>
                      </div>

                      {/* Status History Summary */}
                      <div className="mt-3 p-3 bg-white border border-blue-100 rounded-lg">
                        <p className="text-xs text-muted-foreground font-medium mb-2">Status Changes: <span className="font-bold text-foreground">{orderData.statusHistory.length}</span></p>
                        <div className="flex flex-wrap gap-2">
                          {orderData.statusHistory.map((history, idx) => (
                            <span key={history.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 border border-blue-200 text-blue-700">
                              {idx + 1}. {getOrderStatusLabel(history.orderStatus)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                <CardContent className="space-y-3">
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3 pl-2 border-l-2 border-gray-300">
                        <div>
                          <span className="text-muted-foreground">Qty:</span>
                          <p className="font-medium">{item.quantity}</p>
                        </div>
                        {item.hasPromotion && item.currentPrice && (
                          <div>
                            <span className="text-muted-foreground">Original Price:</span>
                            <p className="font-medium line-through text-orange-500">{formatCurrency(item.currentPrice)}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Unit Price:</span>
                          <p className="font-medium">{formatCurrency(item.finalPrice)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Item Total:</span>
                          <p className="font-bold text-green-600">{formatCurrency(item.totalPrice)}</p>
                        </div>
                        {(item.customizationTotal ?? 0) > 0 && (
                          <div>
                            <span className="text-muted-foreground">Add-ons:</span>
                            <p className="font-medium text-blue-600">+{formatCurrency(item.customizationTotal)}</p>
                          </div>
                        )}
                      </div>

                      {/* Promotion Badge */}
                      {item.hasPromotion && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                          <h5 className="text-xs font-bold text-orange-700 uppercase mb-2">🎉 Promotion Applied</h5>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-orange-600">Discount Type:</span>
                              <span className="font-medium text-foreground">
                                {item.promotionType === "PERCENTAGE" ? `${item.promotionValue}%` : formatCurrency(item.promotionValue || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-orange-600">Discount Amount:</span>
                              <span className="font-bold text-orange-600">
                                -{formatCurrency((item.currentPrice || 0) - (item.finalPrice || 0))}
                              </span>
                            </div>
                            {item.promotionFromDate && item.promotionToDate && (
                              <div className="flex justify-between">
                                <span className="text-orange-600">Valid:</span>
                                <span className="font-medium text-foreground text-xs">
                                  {dateTimeFormat(item.promotionFromDate)} to {dateTimeFormat(item.promotionToDate)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

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
                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">📫 Address & Delivery</h4>
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
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-foreground">
                    📈 Status History ({orderData.statusHistory.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {orderData.statusHistory.map((history, idx) => (
                      <div
                        key={history.id}
                        className="text-sm border border-border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-sm text-foreground">
                              {getOrderStatusLabel(history.orderStatus)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Changed:</span> {dateTimeFormat(history.createdAt)}
                          </div>
                          {history.note && (
                            <p className="text-xs text-muted-foreground italic border-l-2 border-blue-300 pl-2">
                              "{history.note}"
                            </p>
                          )}
                          {history.changedByName && (
                            <div className="text-xs border-t pt-2 mt-2">
                              <p className="text-muted-foreground">
                                By:{" "}
                                <span className="font-medium text-foreground">
                                  {history.changedByName}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
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
              <CardContent className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
