/**
 * POS Checkout Request Models
 * Matches backend POSCheckoutRequest and nested DTOs exactly.
 */

import { ItemPricingSnapshot, OrderPricingSnapshot } from "../type/pos-page-type";

// Item in the cart — matches backend POSCheckoutItemRequest
export interface POSCheckoutItemRequest {
  productId: string;
  productSizeId?: string | null;
  quantity: number;

  // Display fields
  productName?: string;
  productImageUrl?: string;
  sizeName?: string | null;
  status?: string;

  // Snapshot BEFORE any POS modifications (original product pricing)
  before: ItemPricingSnapshot;

  // Was item modified by POS operator?
  hadChangeFromPOS: boolean;

  // Snapshot AFTER POS modifications (current/final pricing)
  after: ItemPricingSnapshot;

  // Flat pricing fields (used by backend as fallback / legacy support)
  originalPrice?: number;
  currentPrice?: number;
  finalPrice?: number;
  hasActivePromotion?: boolean;
  overridePrice?: number;
  promotionType?: string | null;
  promotionValue?: number | null;
  totalBeforeDiscount?: number;
  discountAmount?: number;
  totalPrice?: number;
}

export interface DeliveryOptionRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
}

// Cart summary — matches backend POSCheckoutRequest.CartSummary
export interface CartSummary {
  businessId: string;
  businessName?: string;
  items: POSCheckoutItemRequest[];
  totalItems: number;
  totalQuantity: number;
  subtotalBeforeDiscount: number;
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
}

export interface POSCheckoutAddressRequest {
  village: string;
  commune: string;
  district: string;
  province: string;
  streetNumber?: string;
  houseNumber?: string;
  note?: string;
  latitude?: number;
  longitude?: number;
}

// Order-level pricing audit trail — matches backend POSCheckoutRequest.PricingInfo
export interface PricingInfo {
  before: OrderPricingSnapshot;
  hadOrderLevelChangeFromPOS: boolean;
  after: OrderPricingSnapshot;
  orderLevelChangeReason?: string;
}

export interface PaymentInfo {
  paymentMethod: string;
  paymentStatus?: string;
}

// Top-level checkout request — matches backend POSCheckoutRequest exactly
export interface POSCheckoutRequest {
  businessId: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;

  deliveryAddress: POSCheckoutAddressRequest;
  deliveryOption: DeliveryOptionRequest;
  cart: CartSummary;

  // Order-level pricing with before/after audit trail
  pricing: PricingInfo;

  payment: PaymentInfo;

  orderStatus?: string;
  customerNote?: string;
  businessNote?: string;
}

export interface POSCheckoutResponse {
  id: string;
  orderNumber: string;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  orderStatus: string;
  source: string;
  paymentMethod: string;
  paymentStatus: string;
  createdBy: string;
  createdAt: string;
  customerName?: string;
  customerPhone?: string;
}
