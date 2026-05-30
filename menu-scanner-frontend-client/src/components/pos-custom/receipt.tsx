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

  return (
    <div className="w-full max-w-sm mx-auto font-mono text-xs bg-white p-0">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-2 mb-3">
        <h1 className="text-sm font-bold tracking-wider">RECEIPT</h1>
      </div>

      {/* Order Info */}
      <div className="text-center text-xs mb-3 border-b border-gray-400 pb-2">
        <div>Order #: {orderNumber}</div>
        <div>Date: {formattedDate} • {formattedTime}</div>
        <div className="font-semibold">{businessName}</div>
      </div>

      {/* Items */}
      <div className="mb-3 border-b border-gray-400 pb-2">
        <div className="text-center text-xs font-bold border-b border-gray-400 pb-1 mb-2">
          ITEMS
        </div>
        <div className="mb-2">
          <div className="flex justify-between font-bold text-xs mb-1">
            <span>NAME</span>
            <span className="flex gap-2">
              <span className="w-6 text-center">QTY</span>
              <span className="w-12 text-right">DISCOUNT</span>
              <span className="w-14 text-right">TOTAL</span>
            </span>
          </div>
          <div className="border-b border-gray-300 mb-1"></div>

          {items.map((item) => {
            const discount =
              item.customizations && item.customizations.length > 0
                ? `${item.customizations.length}`
                : "—";

            return (
              <div key={item.id} className="mb-2">
                <div className="flex justify-between text-xs">
                  <span className="flex-1">{item.productName}</span>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <span className="w-12 text-right">{discount}</span>
                  <span className="w-14 text-right">
                    {formatCurrency(item.finalPrice * item.quantity)}
                  </span>
                </div>

                {item.customizations && item.customizations.length > 0 && (
                  <div className="ml-2 text-xs text-gray-600">
                    {item.customizations.map((custom) => (
                      <div key={custom.id} className="flex justify-between">
                        <span>└─ {custom.name}</span>
                        <span className="text-right">
                          +{formatCurrency(custom.priceAdjustment)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Summary */}
      <div className="mb-3 border-b-2 border-gray-800 pb-3">
        <div className="text-center text-xs font-bold mb-2">ORDER SUMMARY</div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Payment Method</span>
            <span className="font-semibold">{paymentMethod}</span>
          </div>

          <div className="flex justify-between">
            <span>Subtotal w/ Add-ons</span>
            <span className="font-semibold">
              {formatCurrency(subtotalWithAddons)}
            </span>
          </div>

          {discountAmount > 0 && (
            <>
              <div className="flex justify-between text-red-600">
                <span>Discount (Promotions)</span>
                <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal After Discount</span>
                <span className="font-semibold">
                  {formatCurrency(subtotalAfterDiscount)}
                </span>
              </div>
            </>
          )}

          <div className="flex justify-between">
            <span>Tax</span>
            <span className="font-semibold">+{formatCurrency(taxAmount)}</span>
          </div>

          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-semibold">
              {deliveryFee > 0 ? `+${formatCurrency(deliveryFee)}` : "Free"}
            </span>
          </div>

          <div className="border-t border-gray-400 pt-1 mt-1 flex justify-between font-bold text-sm">
            <span>TOTAL AMOUNT</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs py-2">
        <div>Thank you for your order!</div>
        <div>Please visit again</div>
      </div>
    </div>
  );
}
