/**
 * Order Response Types
 * Complete type definitions matching backend OrderResponse
 */

import { OrderStatus } from '@/enums/order-status.enum';
import { OrderSource } from '@/enums/order-source.enum';

export interface OrderStatusHistoryUserInfo {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  businessId?: string;
  fullName?: string;
}

export interface OrderStatusHistoryResponse {
  id: string;
  statusName: string;
  statusDescription: string | null;
  note: string | null;
  changedBy: OrderStatusHistoryUserInfo | null;
  changedAt: string;
}

export interface OrderDeliveryAddressDto {
  village: string;
  commune: string;
  district: string;
  province: string;
  streetNumber: string;
  houseNumber: string;
  note: string;
  latitude: number;
  longitude: number;
}

export interface OrderDeliveryOptionDto {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
}

// Pricing snapshot at a point in time (before or after modifications)
export interface OrderPricingSnapshot {
  totalItems: number;
  subtotalBeforeDiscount: number;
  subtotal: number;
  totalDiscount: number;
  deliveryFee: number;
  taxAmount: number;
  finalTotal: number;
}

// Nested pricing with before/after audit trail — matches backend OrderPricingInfo
export interface OrderPricingInfo {
  before: OrderPricingSnapshot;
  hadOrderLevelChangeFromPOS: boolean;
  after: OrderPricingSnapshot | null;
  reason: string;
}

export interface OrderPaymentInfo {
  paymentMethod: string;
  paymentStatus: "PENDING" | "PAID" | "UNPAID" | "REFUNDED" | "PARTIALLY_PAID";
}

export interface OrderItemProductInfo {
  id: string;
  name: string;
  imageUrl: string;
  sizeId: string | null;
  sizeName: string;
  status: "ACTIVE" | "INACTIVE";
}

// Pricing snapshot for a single item at a point in time
export interface OrderItemPricingSnapshot {
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

// Item with before/after audit trail — matches backend OrderItemResponse
export interface OrderItemResponse {
  id: string;
  product: OrderItemProductInfo;
  before: OrderItemPricingSnapshot;
  hadChangeFromPOS: boolean;
  after: OrderItemPricingSnapshot | null;
  reason: string | null;
}

export interface OrderResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  businessId: string;
  businessName: string;
  deliveryAddress: OrderDeliveryAddressDto;
  deliveryOption: OrderDeliveryOptionDto;
  orderStatus: OrderStatus;
  source: OrderSource;
  customerNote: string;
  businessNote: string | null;
  pricing: OrderPricingInfo;
  payment: OrderPaymentInfo;
  items: OrderItemResponse[];
  statusHistory: OrderStatusHistoryResponse[];
}
