"use client";

import { formatCurrency } from "@/utils/common/currency-format";
import { PosPageCartItem } from "@/features/business/store/models/type/pos-page-type";

interface ReceiptProps {
  orderNumber: string;
  date: Date;
  businessName: string;
  items: PosPageCartItem[];
  subtotalWithAddons: number;
  discountAmount: number;
  subtotalAfterDiscount: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: string;
}

export function Receipt({
  orderNumber,
  date,
  businessName,
  items,
  subtotalWithAddons,
  discountAmount,
  subtotalAfterDiscount,
  taxAmount,
  deliveryFee,
  totalAmount,
  paymentMethod,
}: ReceiptProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const formattedTime = new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const promotionalItems = items.filter((item) => item.hasPromotion);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white">
      <style>{`
        @media print {
          * {
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          body, html {
            width: 100% !important;
            height: 100% !important;
          }
          .receipt-wrapper {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .receipt-content {
            width: 100% !important;
            page-break-inside: avoid;
          }
        }

        .receipt-wrapper {
          width: 100%;
          font-family: 'Courier New', monospace;
          background: white;
          padding: 0;
          margin: 0;
        }
      `}</style>

      <div className="receipt-wrapper">
        <div className="receipt-content p-6 max-w-2xl mx-auto">
          {/* Premium Header */}
          <div className="text-center border-b-4 border-gray-900 pb-4 mb-4">
            <div className="mb-2">
              <div className="text-4xl font-bold text-gray-900">═════════════════════</div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-widest mb-1">RECEIPT</h1>
            <p className="text-gray-600 text-xs">Professional Receipt Document</p>
            <div className="text-4xl font-bold text-gray-900 mt-2">═════════════════════</div>
          </div>

          {/* Business & Order Info */}
          <div className="mb-4 px-4 py-3 border border-gray-400">
            <p className="text-gray-900 font-bold text-center text-lg mb-3">{businessName}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-700 font-semibold">ORDER NUMBER</p>
                <p className="text-gray-900 font-bold text-lg">{orderNumber}</p>
              </div>
              <div>
                <p className="text-gray-700 font-semibold">DATE & TIME</p>
                <p className="text-gray-900 font-bold">{formattedDate}</p>
                <p className="text-gray-900 font-bold">{formattedTime}</p>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="mb-4 border border-gray-400">
            <div className="bg-gray-900 text-white px-4 py-2 font-bold text-sm">
              ITEMS ({items.length})
            </div>

            <div className="px-4 py-3">
              {/* Column Headers */}
              <div className="grid grid-cols-12 gap-2 mb-2 pb-2 border-b-2 border-gray-900 text-xs font-bold">
                <div className="col-span-6">ITEM DESCRIPTION</div>
                <div className="col-span-2 text-center">QTY</div>
                <div className="col-span-2 text-center">PRICE</div>
                <div className="col-span-2 text-right">TOTAL</div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {items.map((item, index) => {
                  const itemTotal = item.finalPrice * item.quantity;
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

                  return (
                    <div key={item.id} className="pb-3 border-b border-gray-300">
                      <div className="grid grid-cols-12 gap-2 text-sm mb-2">
                        <div className="col-span-6">
                          <p className="font-bold text-gray-900">{index + 1}. {item.productName || "Product"}</p>
                          {item.sizeName && (
                            <p className="text-gray-600 text-xs">Size: {item.sizeName}</p>
                          )}
                        </div>
                        <div className="col-span-2 text-center font-bold text-gray-900">{item.quantity}</div>
                        <div className="col-span-2 text-center text-gray-900">{formatCurrency(item.finalPrice)}</div>
                        <div className="col-span-2 text-right font-bold text-gray-900">{formatCurrency(itemTotal)}</div>
                      </div>

                      {promotionLabel && (
                        <div className="ml-4 bg-green-50 border-l-3 border-green-600 px-2 py-1.5 text-xs">
                          <p className="font-bold text-green-700">✓ PROMOTION: {promotionLabel}</p>
                        </div>
                      )}

                      {item.customizations && item.customizations.length > 0 && (
                        <div className="ml-4 mt-0.5 text-xs flex justify-between text-gray-600 min-w-0">
                          <span className="truncate min-w-0">
                            +{item.customizations.map((c) => c.name).join(", ")}
                          </span>
                          <span className="ml-2 shrink-0">
                            +{formatCurrency(item.customizations.reduce((s, c) => s + (c.priceAdjustment || 0), 0))}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Promotions Summary */}
          {promotionalItems.length > 0 && (
            <div className="mb-4 border-2 border-green-600 px-4 py-3 bg-green-50">
              <p className="font-bold text-green-900 mb-2 text-sm">🎉 PROMOTIONS APPLIED</p>
              <div className="space-y-2">
                {promotionalItems.map((item, idx) => (
                  <div key={`promo-${idx}`} className="flex justify-between text-sm">
                    <span className="text-green-800">{item.productName || "Product"}</span>
                    <span className="font-bold text-green-900">
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
          <div className="mb-4 border border-gray-400 px-4 py-3 bg-gray-50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal with Add-ons</span>
                <span className="font-bold text-gray-900">{formatCurrency(subtotalWithAddons)}</span>
              </div>

              {discountAmount > 0 && (
                <>
                  <div className="flex justify-between bg-red-50 px-2 py-1">
                    <span className="text-red-700 font-semibold">Discount (Promotions)</span>
                    <span className="font-bold text-red-700">-{formatCurrency(discountAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Subtotal After Discount</span>
                    <span className="font-bold text-gray-900">{formatCurrency(subtotalAfterDiscount)}</span>
                  </div>
                </>
              )}

              {taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Tax</span>
                  <span className="font-bold text-gray-900">+{formatCurrency(taxAmount)}</span>
                </div>
              )}

              {deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Delivery Fee</span>
                  <span className="font-bold text-gray-900">+{formatCurrency(deliveryFee)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Total Amount */}
          <div className="mb-4 border-4 border-gray-900 px-4 py-4 bg-gray-900 text-white">
            <p className="text-xs font-semibold mb-1">FINAL AMOUNT DUE</p>
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-bold">TOTAL:</span>
              <span className="text-3xl font-bold">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-4 border border-gray-400 px-4 py-3 bg-gray-50">
            <p className="text-gray-700 font-semibold text-sm">PAYMENT METHOD</p>
            <p className="text-gray-900 font-bold text-base">{paymentMethod}</p>
          </div>

          {/* Footer */}
          <div className="text-center border-t-4 border-gray-900 pt-4 space-y-2">
            <div className="font-bold text-gray-900 text-sm">
              ✓ Thank You For Your Order!
            </div>
            <p className="text-xs text-gray-700">
              Please keep this receipt for your records.
            </p>
            <p className="text-xs text-gray-600">
              We appreciate your business!
            </p>
            <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-400">
              <p>Generated: {formattedDate} at {formattedTime}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
