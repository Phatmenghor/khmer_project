"use client";

import { Messages } from "@/constants/messages";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store";
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
import { Download } from "lucide-react";
// html2canvas + jspdf are loaded lazily inside the download handler so
// they stay out of the admin route bundle until the user actually clicks
// "Download receipt".

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

  const handleDownloadReceipt = async () => {
    if (!orderData?.id || !orderData?.items) return;
    try {
      const element = document.createElement("div");
      element.style.position = "absolute";
      element.style.left = "-9999px";
      element.style.width = "80mm";
      element.style.height = "auto";
      element.style.fontFamily = "monospace";
      element.style.fontSize = "11px";
      element.style.backgroundColor = "#fff";
      element.style.padding = "4mm";

      const date = new Date(orderData.createdAt);
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const subtotal = orderData.pricing?.subtotal || 0;
      const discount = orderData.pricing?.discountAmount || 0;
      const subtotalAfterDiscount = subtotal - discount;
      const tax = orderData.pricing?.taxAmount || 0;
      const delivery = orderData.pricing?.deliveryFee || 0;
      const total = orderData.pricing?.finalTotal || 0;

      const itemsHTML = orderData.items.map(item => {
        const itemTotal = (item.finalPrice || 0) * item.quantity;
        return `
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px;">
            <span style="flex: 1;">${item.productName}</span>
            <span style="width: 16px; text-align: center;">${item.quantity}</span>
            <span style="width: 30px; text-align: right;">—</span>
            <span style="width: 50px; text-align: right;">$${itemTotal.toFixed(2)}</span>
          </div>
        `;
      }).join('');

      element.innerHTML = `
        <div style="width: 80mm; background: white;">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 6px;">
            <div style="font-weight: bold; font-size: 13px; letter-spacing: 1px;">RECEIPT</div>
          </div>

          <!-- Order Info -->
          <div style="text-align: center; font-size: 10px; margin-bottom: 6px; border-bottom: 1px solid #666; padding-bottom: 4px;">
            <div>Order #: ${orderData.orderNumber}</div>
            <div>Date: ${formattedDate} • ${formattedTime}</div>
            <div style="font-weight: bold;">${orderData.businessName || 'Restaurant'}</div>
          </div>

          <!-- Items Section -->
          <div style="margin-bottom: 6px; border-bottom: 1px solid #666; padding-bottom: 4px;">
            <div style="text-align: center; font-weight: bold; font-size: 10px; border-bottom: 1px solid #666; padding-bottom: 2px; margin-bottom: 4px;">ITEMS</div>
            <div style="margin-bottom: 4px;">
              <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 10px; margin-bottom: 2px;">
                <span style="flex: 1;">NAME</span>
                <span style="width: 16px; text-align: center;">QTY</span>
                <span style="width: 30px; text-align: right;">DSC</span>
                <span style="width: 50px; text-align: right;">TOTAL</span>
              </div>
              <div style="border-bottom: 1px solid #ccc; margin-bottom: 2px;"></div>
              ${itemsHTML}
            </div>
          </div>

          <!-- Order Summary -->
          <div style="margin-bottom: 6px; border-bottom: 2px solid #000; padding-bottom: 6px;">
            <div style="text-align: center; font-weight: bold; font-size: 10px; margin-bottom: 4px;">ORDER SUMMARY</div>
            <div style="font-size: 10px; line-height: 1.6;">
              <div style="display: flex; justify-content: space-between;">
                <span>Payment Method</span>
                <span style="font-weight: bold;">${orderData.payment?.paymentStatus || 'CASH'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Subtotal w/ Add-ons</span>
                <span style="font-weight: bold;">$${subtotal.toFixed(2)}</span>
              </div>
              ${discount > 0 ? `
              <div style="display: flex; justify-content: space-between; color: #d32f2f;">
                <span>Discount (Promotions)</span>
                <span style="font-weight: bold;">-$${discount.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Subtotal After Discount</span>
                <span style="font-weight: bold;">$${subtotalAfterDiscount.toFixed(2)}</span>
              </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between;">
                <span>Tax</span>
                <span style="font-weight: bold;">+$${tax.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Delivery Fee</span>
                <span style="font-weight: bold;">${delivery > 0 ? `+$${delivery.toFixed(2)}` : 'Free'}</span>
              </div>
              <div style="border-top: 1px solid #666; padding-top: 3px; margin-top: 3px; display: flex; justify-content: space-between; font-weight: bold; font-size: 11px;">
                <span>TOTAL AMOUNT</span>
                <span>$${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; font-size: 10px; padding-top: 4px;">
            <div>Thank you for your order!</div>
            <div>Please visit again</div>
          </div>
        </div>
      `;

      document.body.appendChild(element);

      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 250],
      });

      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * 80) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, 80, imgHeight);
      pdf.save(`receipt-${orderData.orderNumber}.pdf`);

      document.body.removeChild(element);
      showToast.success("Receipt downloaded successfully");
    } catch (error) {
      showToast.error("Failed to generate receipt");
    }
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
                <p className="text-xs text-muted-foreground mt-1">
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
        {}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold text-foreground">
              Order Details
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {orderData.orderNumber}
            </p>
          </div>
          <button
            onClick={handleDownloadReceipt}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
            title="Download receipt as PDF"
          >
            <Download className="w-3 h-3" />
            Receipt
          </button>
        </div>

        {}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
{}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/30">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-xs font-bold text-foreground">📋 Order & Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-3">
                {}
                <div className="bg-primary/5 border border-primary/20 rounded p-2">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Order Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <DisplayField
                      label="Order Number"
                      value={orderData.orderNumber}
                    />
                    <DisplayField
                      label="Order Type"
                      value={
                        orderData.source === "PUBLIC"
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
                    {orderData.customerNote && (
                      <DisplayField
                        label="Customer Note"
                        value={orderData.customerNote}
                      />
                    )}
                  </div>
                </div>

                {}
                <div className="bg-amber-50 border border-amber-200 rounded p-2">
                  <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Pricing Breakdown</h4>
                  <div className="space-y-2">
                    <div className="bg-white border border-amber-100 rounded p-2 space-y-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
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
                        <div className="md:col-span-2 border-t pt-1 mt-1">
                          <DisplayField
                            label="Final Total"
                            value={
                              <span className="text-xs font-bold text-green-600">
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

            {}
            {orderData.items && orderData.items.length > 0 && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/30">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-xs font-bold text-foreground">
                    🛒 Order Items ({orderData.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-3">
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3">Items List</h4>
                    <div className="space-y-3">
                  {orderData.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 border rounded bg-gray-50 border-gray-200"
                    >
                      {}
                      <div className="mb-2">
                        <div className="flex items-start gap-2">
                          {}
                          {item.product?.imageUrl && (
                            <div className="flex-shrink-0 rounded overflow-hidden border border-gray-200">
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-11 h-11 object-cover"
                              />
                            </div>
                          )}
                          {}
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <h4 className="font-semibold text-xs">
                                #{idx + 1} - {item.product?.name || "Unknown"}
                              </h4>
                            </div>
                            {}
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
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

                      {}
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs border-t pt-2 mt-2">
                        {}
                        <div className="space-y-1">
                          <span className="text-muted-foreground text-xs font-medium">Qty:</span>
                          <p className="font-bold text-xs">{item.quantity}</p>
                        </div>

                        {}
                        <div className="space-y-1">
                          <span className="text-muted-foreground text-xs font-medium">Unit Price:</span>
                          <p className="font-bold text-xs">{formatCurrency(item.finalPrice)}</p>
                        </div>

                        {}
                        <div className="space-y-1">
                          <span className="text-muted-foreground text-xs font-medium">Item Total:</span>
                          <p className="font-bold text-green-600 text-xs">{formatCurrency(item.totalPrice)}</p>
                        </div>

                        {}
                        {(item.customizationTotal ?? 0) > 0 && (
                          <div className="space-y-1">
                            <span className="text-muted-foreground text-xs font-medium">Add-ons:</span>
                            <p className="font-bold text-blue-600 text-xs">+{formatCurrency(item.customizationTotal ?? 0)}</p>
                          </div>
                        )}
                      </div>

                      {}
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                          <h5 className="text-xs font-bold text-blue-700 uppercase mb-1">✨ Add-ons / Customizations</h5>
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
                  </div>
                </CardContent>
              </Card>
            )}


            {}
            {orderData.deliveryAddress && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/30">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-xs font-bold text-foreground">📍 Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-3">
                  {}
                  <div className="bg-blue-50 border border-blue-200 rounded p-2">
                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Address & Delivery</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <DisplayField
                        label="Full Address"
                        value={
                          <span className="text-xs">
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
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs text-foreground flex-1">
                              {orderData.deliveryAddress.note}
                            </p>
                            <div className="flex gap-1 flex-shrink-0">
                              {}
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
                                  showToast.success(Messages.clipboard.addressCopied);
                                }}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 p-1 rounded transition-colors font-semibold"
                                title="Copy address and note"
                              >
                                📋 Copy
                              </button>
                              {}
                              {orderData.deliveryAddress.latitude &&
                                orderData.deliveryAddress.longitude && (
                                  <button
                                    onClick={() => {
                                      const mapsUrl = `https://www.google.com/maps?q=${orderData.deliveryAddress.latitude},${orderData.deliveryAddress.longitude}`;
                                      window.open(mapsUrl, "_blank");
                                    }}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 p-1 rounded transition-colors font-semibold"
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


            {}
            {orderData.statusHistory && orderData.statusHistory.length > 0 && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/30">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-xs font-bold text-foreground">
                    📈 Status History ({orderData.statusHistory.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-3">
                  <div className="space-y-2">
                    {orderData.statusHistory.map((history, idx) => (
                      <div
                        key={history.id}
                        className="bg-white border border-slate-200 rounded p-3 hover:shadow-md transition-all duration-200 hover:border-slate-300"
                      >
                        {}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-foreground">
                              {history.statusName}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">
                            {dateTimeFormat(history.changedAt)}
                          </span>
                        </div>

                        {}
                        {history.note && (
                          <p className="text-xs text-slate-600 border-l-3 border-blue-500 pl-2 mb-0">
                            {history.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/30">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-xs font-bold text-foreground">⚙️ System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-3">
                <div className="bg-slate-50 border border-slate-200 rounded p-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Metadata</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
