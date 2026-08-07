"use client";

import { Receipt as SharedReceipt, ReceiptProps } from "@/components/shared/receipt/receipt";
import { PosPageCartItem } from "@/features/business/store/models/type/pos-page-type";
import { useAppSelector } from "@/store";
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selector";

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
  paymentStatus?: string;
  deliveryOption?: {
    name: string;
    price: number;
  };
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
  paymentStatus,
  deliveryOption,
}: PosReceiptProps) {
  const businessSettings = useAppSelector(selectBusinessSettings);

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
      taxPercentage: businessSettings?.taxPercentage ?? 0,
    },
    paymentMethod,
    paymentStatus: paymentStatus || "PAID",
    deliveryOption,
    businessLogo: businessSettings?.logoBusiness?.sm,
    businessAddress: businessSettings?.contactAddress,
    businessPhone: businessSettings?.contactPhone,
    businessEmail: businessSettings?.contactEmail,
    wifiName: businessSettings?.wifiName,
    wifiPassword: businessSettings?.wifiPassword,
  };

  return <SharedReceipt {...props} />;
}
