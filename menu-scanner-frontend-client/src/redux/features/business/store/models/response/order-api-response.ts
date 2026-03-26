/**
 * Order API Response Models - Matches Backend DTOs exactly
 * Includes before/after audit trail for complete history
 */

// Item-level pricing snapshot (before or after POS modification)
export interface OrderItemPricingSnapshotApi {
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
}

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

  // Snapshot BEFORE any POS modifications
  before: OrderItemPricingSnapshotApi;

  // Was item modified from POS?
  hadChangeFromPOS: boolean;

  // Snapshot AFTER POS modifications (null if no change)
  after: OrderItemPricingSnapshotApi | null;

  // Reason for the change (if any)
  reason: string | null;
}

// Order-level pricing snapshot (before or after order-level discount)
export interface OrderPricingSnapshotApi {
  totalItems: number;
  subtotalBeforeDiscount: number;
  subtotal: number;
  totalDiscount: number;
  deliveryFee: number;
  taxAmount: number;
  finalTotal: number;
}

// Pricing with before/after audit trail — matches backend OrderPricingInfo
export interface OrderPricingApiResponse {
  before: OrderPricingSnapshotApi;
  hadOrderLevelChangeFromPOS: boolean;
  after: OrderPricingSnapshotApi | null;
  reason: string;
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
    note?: string;
    latitude?: number;
    longitude?: number;
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

  pricing: OrderPricingApiResponse;
  items: OrderItemApiResponse[];

  payment: {
    paymentMethod: string;
    paymentStatus: string;
  };

  statusHistory: {
    id: string;
    statusName: string;
    statusDescription: string | null;
    note: string | null;
    changedBy: {
      userId: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      businessId?: string;
      fullName?: string;
    } | null;
    changedAt: string;
  }[];

  createdAt: string;
  updatedAt: string;
}
