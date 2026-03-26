/**
 * Order API Response Models - Matches Backend DTOs
 * Includes before/after audit trail for complete history
 */

export interface OrderItemApiResponse {
  id: string;
  product: {
    id: string;
    name: string;
    imageUrl: string;
    sizeId: string | null;
    sizeName: string | null;
    status: string;
  };

  // ===== AUDIT TRAIL =====
  // Before: Original pricing
  before: {
    currentPrice: number;
    finalPrice: number;
    hasActivePromotion: boolean;
    quantity: number;
    totalBeforeDiscount: number;
    discountAmount: number;
    totalPrice: number;
    promotionType: string | null;
    promotionValue: number | null;
    promotionFromDate: string | null;
    promotionToDate: string | null;
  };

  // Was item modified from POS?
  hadChangeFromPOS: boolean;

  // After: Final pricing after all changes
  after: {
    currentPrice: number;
    finalPrice: number;
    hasActivePromotion: boolean;
    quantity: number;
    totalBeforeDiscount: number;
    discountAmount: number;
    totalPrice: number;
    promotionType: string | null;
    promotionValue: number | null;
    promotionFromDate: string | null;
    promotionToDate: string | null;
  };

  // Detailed audit metadata (if changed)
  auditMetadata?: {
    changeType: "PRICE_OVERRIDE" | "PROMOTION_APPLIED" | "QUANTITY_CHANGED" | "COMBINED";
    discountType?: "FIXED_AMOUNT" | "PERCENTAGE" | null;
    discountValue?: number | null;
    originalPrice: number;
    updatedPrice: number;
    reason: string;
    changedAt?: string;
  };
}

export interface OrderPricingApiResponse {
  // Before: Pricing before order-level discount
  before: {
    totalItems: number;
    subtotalBeforeDiscount: number;
    subtotal: number;
    totalDiscount: number;
    deliveryFee: number;
    taxAmount: number;
    finalTotal: number;
  };

  // Was order total modified?
  hadOrderLevelChangeFromPOS: boolean;

  // After: Pricing after order-level discount
  after: {
    totalItems: number;
    subtotalBeforeDiscount: number;
    subtotal: number;
    totalDiscount: number;
    deliveryFee: number;
    taxAmount: number;
    finalTotal: number;
  };

  // Detailed discount metadata (if applied)
  discountMetadata?: {
    discountType: "FIXED_AMOUNT" | "PERCENTAGE";
    discountValue: number;
    beforeTotal: number;
    afterTotal: number;
    amountSaved: number;
    reason: string;
    appliedAt?: string;
  };

  // Reason for order-level change
  orderLevelChangeReason?: string;
}

export interface OrderApiResponse {
  id: string;
  orderNumber: string;
  orderStatus: string;

  // Customer info
  customerId: string | null;
  customerName: string | null;
  customerPhone: string | null;

  // Business info
  businessId: string;
  businessName: string;

  // Delivery info
  deliveryAddress: {
    village: string;
    commune: string;
    district: string;
    province: string;
    streetNumber?: string;
    houseNumber?: string;
  };
  deliveryOption: {
    name: string;
    description?: string;
    imageUrl?: string;
    price?: number;
  };

  // Notes
  customerNote: string;
  businessNote: string;

  // ===== AUDIT TRAIL WITH BEFORE/AFTER =====
  pricing: OrderPricingApiResponse;

  // Items with audit trail
  items: OrderItemApiResponse[];

  // Payment info
  payment: {
    paymentMethod: string;
    paymentStatus: string;
  };

  // Status history
  statusHistory: any[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
