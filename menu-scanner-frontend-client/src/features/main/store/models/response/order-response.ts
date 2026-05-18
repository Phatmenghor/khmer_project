/**
 * Order Response Types - Simplified without audit trail snapshots
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

export interface OrderPricingInfo {
  totalItems: number;
  subtotal: number;
  customizationTotal: number;
  deliveryFee: number;
  taxPercentage: number;
  taxAmount: number;
  discountAmount: number;
  discountType?: string;
  discountReason?: string;
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
  sku?: string;
  barcode?: string;
}

export interface CustomizationDetail {
  productCustomizationId: string;
  name: string;
  priceAdjustment: number;
}

export interface OrderItemResponse {
  id: string;
  product: OrderItemProductInfo;
  quantity: number;
  finalPrice: number;
  totalPrice: number;
  customizations?: CustomizationDetail[];
  customizationTotal?: number;
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
