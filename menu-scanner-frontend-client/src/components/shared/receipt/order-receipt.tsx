"use client";

import { formatCurrency } from "@/utils/common/currency-format";
import { OrderApiResponse } from "@/features/business/store/models/response/order-api-response";

interface OrderReceiptProps {
  order: OrderApiResponse;
}

export function OrderReceipt({ order }: OrderReceiptProps) {
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const formattedTime = new Date(order.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const promotionalItems = order.items.filter((item) => item.hasPromotion);

  return (
    <div className="w-full max-w-sm mx-auto bg-white p-4">
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .receipt-container { margin: 0; padding: 0; }
          .receipt-container * { box-shadow: none !important; border-radius: 0 !important; }
        }
      `}</style>

      <div className="receipt-container font-sans text-sm">
        {/* Premium Header */}
        <div className="text-center border-b-4 border-blue-900 pb-4 mb-4">
          <div className="mb-2">
            <div className="text-3xl font-bold text-blue-900 tracking-wider">📋</div>
          </div>
          <h1 className="text-xl font-bold text-blue-900 tracking-widest">RECEIPT</h1>
          <p className="text-gray-600 text-xs mt-1">Professional Receipt Document</p>
        </div>

        {/* Business & Order Info */}
        <div className="bg-blue-50 border-l-4 border-blue-900 px-3 py-3 mb-4 rounded-r">
          <div className="mb-2">
            <p className="text-blue-900 font-bold text-lg">{order.businessName}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-600 font-semibold">Order Number</p>
              <p className="text-blue-900 font-bold text-base">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Date & Time</p>
              <p className="text-blue-900 font-bold">{formattedDate}</p>
              <p className="text-blue-900 font-bold">{formattedTime}</p>
            </div>
          </div>
          {order.customerName && (
            <div className="mt-2 pt-2 border-t border-blue-200">
              <p className="text-gray-600 font-semibold text-xs">Customer</p>
              <p className="text-blue-900 font-semibold">{order.customerName}</p>
              {order.customerPhone && (
                <p className="text-gray-600 text-xs">{order.customerPhone}</p>
              )}
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="mb-4 px-3 py-2 rounded-lg bg-blue-100 border border-blue-300">
          <p className="text-xs font-semibold text-gray-600 mb-1">Order Status</p>
          <div className="flex justify-between items-center">
            <p className="font-bold text-blue-900">{order.orderStatus}</p>
            <span className="text-xs px-2 py-1 rounded bg-blue-900 text-white font-semibold">
              {order.payment.paymentStatus}
            </span>
          </div>
        </div>

        {/* Items Section */}
        <div className="mb-4">
          <div className="bg-blue-900 text-white px-3 py-2 font-bold text-sm mb-2 rounded">
            📦 ORDER ITEMS ({order.items.length})
          </div>

          <div className="space-y-3">
            {order.items.map((item, index) => {
              const getPromotionLabel = () => {
                if (!item.hasPromotion || !item.promotionType) return null;
                if (item.promotionType === "PERCENTAGE") {
                  return `${item.promotionValue}% OFF`;
                } else if (item.promotionType === "FIXED") {
                  return `${formatCurrency(item.promotionValue)} OFF`;
                }
                return null;
              };

              const promotionLabel = getPromotionLabel();
              const itemTotal = item.finalPrice * item.quantity;

              return (
                <div key={item.id} className="border-b border-gray-200 pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{index + 1}. {item.product.name}</p>
                      {item.product.sizeName && (
                        <p className="text-xs text-gray-600">Size: {item.product.sizeName}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(itemTotal)}
                      </p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>

                  {promotionLabel && (
                    <div className="mt-2 bg-green-50 border-l-3 border-green-600 px-2 py-1.5 rounded-r">
                      <p className="text-xs font-bold text-green-700">
                        ✓ PROMOTION APPLIED: {promotionLabel}
                      </p>
                    </div>
                  )}

                  {item.customizations && item.customizations.length > 0 && (
                    <div className="mt-2 ml-2 space-y-1">
                      <p className="text-xs font-semibold text-gray-700">Add-ons:</p>
                      {item.customizations.map((custom, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-gray-600">
                          <span className="ml-2">• {custom.name}</span>
                          <span>+{formatCurrency(custom.priceAdjustment)}</span>
                        </div>
                      ))}
                      {item.customizationTotal > 0 && (
                        <div className="flex justify-between text-xs font-semibold text-gray-700 mt-1">
                          <span className="ml-2">Add-ons Subtotal:</span>
                          <span>{formatCurrency(item.customizationTotal)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Promotions Summary */}
        {promotionalItems.length > 0 && (
          <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-600 rounded px-3 py-3">
            <p className="font-bold text-green-900 mb-2">🎉 PROMOTIONS APPLIED</p>
            <div className="space-y-1.5">
              {promotionalItems.map((item, idx) => (
                <div key={`promo-${idx}`} className="flex justify-between text-xs">
                  <span className="text-green-800">{item.product.name}</span>
                  <span className="font-semibold text-green-900">
                    {item.promotionType === "PERCENTAGE"
                      ? `-${item.promotionValue}%`
                      : `-${formatCurrency(item.promotionValue)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Summary */}
        <div className="mb-4">
          <div className="bg-gray-100 border-t-2 border-b-2 border-gray-300 px-3 py-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-700">Subtotal</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(order.pricing.subtotal)}
              </span>
            </div>

            {order.pricing.customizationTotal > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-700">Add-ons</span>
                <span className="font-semibold text-gray-900">
                  +{formatCurrency(order.pricing.customizationTotal)}
                </span>
              </div>
            )}

            {order.pricing.discountAmount > 0 && (
              <>
                <div className="flex justify-between text-xs bg-red-50 px-2 py-1 rounded">
                  <span className="text-red-700 font-semibold">Discount</span>
                  <span className="font-bold text-red-700">
                    -{formatCurrency(order.pricing.discountAmount)}
                  </span>
                </div>
              </>
            )}

            {order.pricing.taxAmount > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-700">
                  Tax ({order.pricing.taxPercentage}%)
                </span>
                <span className="font-semibold text-gray-900">
                  +{formatCurrency(order.pricing.taxAmount)}
                </span>
              </div>
            )}

            {order.pricing.deliveryFee > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-700">Delivery Fee</span>
                <span className="font-semibold text-gray-900">
                  +{formatCurrency(order.pricing.deliveryFee)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Total Amount - Prominent */}
        <div className="mb-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white px-4 py-4 rounded-lg shadow-lg">
          <p className="text-xs font-semibold text-blue-100 mb-1">FINAL AMOUNT DUE</p>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-semibold">Total:</span>
            <span className="text-3xl font-bold">{formatCurrency(order.pricing.finalTotal)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mb-4 bg-blue-50 border-l-4 border-blue-900 px-3 py-3 rounded-r">
          <p className="text-xs font-semibold text-gray-600 mb-1">PAYMENT METHOD</p>
          <p className="font-bold text-blue-900 text-base">{order.payment.paymentMethod}</p>
        </div>

        {/* Footer */}
        <div className="text-center border-t-4 border-blue-900 pt-4 space-y-2">
          <div className="text-sm font-semibold text-blue-900">
            ✓ Thank You For Your Order!
          </div>
          <p className="text-xs text-gray-600">
            Please keep this receipt for your records.
          </p>
          <p className="text-xs text-gray-500">
            Visit us again soon!
          </p>
          <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-300">
            <p>Generated on {formattedDate} at {formattedTime}</p>
            <p className="mt-1 text-xs">Receipt ID: {order.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
