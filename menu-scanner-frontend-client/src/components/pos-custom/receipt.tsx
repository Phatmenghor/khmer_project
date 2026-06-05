"use client";

import { Receipt, ReceiptProps } from "@/components/shared/receipt/receipt";
import { PosPageCartItem } from "@/features/business/store/models/type/pos-page-type";

interface PosReceiptProps {
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
  taxAmount,
  deliveryFee,
  totalAmount,
  paymentMethod,
}: PosReceiptProps) {
  const props: ReceiptProps = {
    businessName,
    orderNumber,
    date,
    items: items.map((item) => ({
      id: item.id,
      name: item.productName,
      sizeName: item.sizeName,
      finalPrice: item.finalPrice,
      quantity: item.quantity,
      totalPrice: item.finalPrice * item.quantity,
      hasPromotion: item.hasPromotion,
      promotionType: item.promotionType,
      promotionValue: item.promotionValue,
      customizations: (item.customizations || []).map((c) => ({
        id: c.productCustomizationId,
        name: c.name,
        priceAdjustment: c.priceAdjustment,
      })),
    })),
    pricing: {
      subtotal: subtotalWithAddons,
      discountAmount,
      taxAmount,
      deliveryFee,
      finalTotal: totalAmount,
    },
    paymentMethod,
  };

  return <Receipt {...props} />;
}
