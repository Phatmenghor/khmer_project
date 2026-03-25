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

export interface OrderPricingInfo {
  totalItems: number;
  subtotalBeforeDiscount: number;
  subtotal: number;
  totalDiscount: number;
  deliveryFee: number;
  taxAmount: number;
  finalTotal: number;
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

export interface OrderItemResponse {
  id: string;
  product: OrderItemProductInfo;
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
  source: OrderSource;  // NEW: Track if order is from POS or Public
  customerNote: string;
  businessNote: string | null;
  pricing: OrderPricingInfo;
  payment: OrderPaymentInfo;
  items: OrderItemResponse[];
  statusHistory: OrderStatusHistoryResponse[];
}
