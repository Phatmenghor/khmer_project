/**
 * Order Type Definitions - All Fields Populated (No Nulls)
 */

import {
  OrderFromEnum,
  OrderStatusEnum,
  PaymentMethodEnum,
  PaymentStatusEnum,
  DeliveryTypeEnum,
  PromotionTypeEnum,
  DeviceTypeEnum,
  OSTypeEnum,
} from '@/enums/order.enum';

/**
 * Delivery Address
 */
export interface DeliveryAddress {
  id: string;
  village: string;
  commune: string;
  district: string;
  province: string;
  streetNumber: string;
  houseNumber: string;
  landmark: string;
  note: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  addressType: 'HOME' | 'OFFICE' | 'RESTAURANT';
  isActive: boolean;
}

/**
 * Delivery Option
 */
export interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  estimatedMinutes: number;
  estimatedMaxMinutes: number;
  isActive: boolean;
  deliveryType: DeliveryTypeEnum;
}

/**
 * Order Status History Entry
 */
export interface OrderStatusHistoryEntry {
  status: OrderStatusEnum;
  changedAt: string; // ISO datetime
  changedBy: string; // user ID or name
  note: string;
}

/**
 * Order Pricing Details
 */
export interface OrderPricingDetails {
  totalItems: number;
  subtotalBeforeDiscount: number;
  subtotal: number;
  discountAmount: number;
  hasActivePromotion: boolean;
  promotionType: PromotionTypeEnum | null;
  promotionValue: number | null;
  deliveryFee: number;
  taxAmount: number;
  finalTotal: number;
}

/**
 * Order Pricing
 */
export interface OrderPricing {
  before: OrderPricingDetails;
  after: OrderPricingDetails | null;
  hadOrderLevelChangeFromPOS: boolean;
  reason: string;
  discountPercent: number;
  taxPercent: number;
  currency: string; // USD, KHR, etc.
}

/**
 * Order Payment
 */
export interface OrderPayment {
  id: string;
  paymentMethod: PaymentMethodEnum;
  paymentStatus: PaymentStatusEnum;
  paidAmount: number;
  changeAmount: number;
  paymentDate: string; // ISO datetime
  transactionId: string;
  notes: string;
}

/**
 * Product Information
 */
export interface OrderProduct {
  id: string;
  name: string;
  imageUrl: string;
  sizeId: string;
  sizeName: string;
  status: 'ACTIVE' | 'INACTIVE';
  category: string;
}

/**
 * Order Item Pricing
 */
export interface OrderItemPricing {
  currentPrice: number;
  finalPrice: number;
  hasActivePromotion: boolean;
  quantity: number;
  totalBeforeDiscount: number;
  discountAmount: number;
  totalPrice: number;
  promotionType: PromotionTypeEnum;
  promotionValue: number;
  promotionFromDate: string; // ISO datetime
  promotionToDate: string; // ISO datetime
}

/**
 * Order Item
 */
export interface OrderItem {
  id: string;
  product: OrderProduct;
  before: OrderItemPricing;
  after: OrderItemPricing | null;
  hadChangeFromPOS: boolean;
  reason: string;
  notes: string;
  specialInstructions: string;
  isAvailable: boolean;
}

/**
 * Device Information
 */
export interface DeviceInfo {
  deviceType: DeviceTypeEnum;
  osType: OSTypeEnum;
  appVersion: string;
  userAgent: string;
  ipAddress: string;
  timezone: string;
  language: string; // Language code: 'km', 'en', etc.
}

/**
 * Complete Order - ALL FIELDS POPULATED (NO NULLS)
 */
export interface Order {
  // Core IDs and Metadata
  id: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  createdBy: string; // user ID or name
  updatedBy: string; // user ID or name

  // Order Identification
  orderNumber: string; // ORD-YYYYMMDD-{SOURCE}-####
  orderFrom: OrderFromEnum; // CUSTOMER or BUSINESS

  // Customer Information
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;

  // Business Information
  businessId: string;
  businessName: string;

  // Delivery Information
  deliveryAddress: DeliveryAddress;
  deliveryOption: DeliveryOption;

  // Order Status
  orderStatus: OrderStatusEnum;
  orderStatusHistory: OrderStatusHistoryEntry[];

  // Notes
  customerNote: string;
  businessNote: string;

  // Pricing
  pricing: OrderPricing;

  // Payment
  payment: OrderPayment;

  // Items
  items: OrderItem[];

  // Timing
  estimatedDeliveryTime: string; // ISO datetime
  actualDeliveryTime: string; // ISO datetime

  // Attributes
  isSpecialOrder: boolean;
  isPriority: boolean;
  source: OrderFromEnum; // Same as orderFrom

  // Device Information
  deviceInfo: DeviceInfo;

  // Additional Fields
  isActive: boolean;
}

/**
 * Order Request for Creating/Updating (from public checkout)
 */
export interface CreateOrderRequest {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddressId: string;
  deliveryOptionId: string;
  customerNote: string;
  items: CreateOrderItemRequest[];
  orderFrom: OrderFromEnum; // Always CUSTOMER for public checkout
}

/**
 * Create Order Item Request
 */
export interface CreateOrderItemRequest {
  productId: string;
  productSizeId: string | null;
  quantity: number;
}

/**
 * Order Response from API
 */
export interface OrderResponse {
  code: number;
  message: string;
  data: Order;
}

/**
 * Orders List Response (Paginated)
 */
export interface OrdersListResponse {
  code: number;
  message: string;
  data: {
    content: Order[];
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    first: boolean;
    last: boolean;
  };
}

/**
 * Order Summary (for lists/tables)
 */
export interface OrderSummary {
  id: string;
  orderNumber: string;
  orderFrom: OrderFromEnum;
  orderStatus: OrderStatusEnum;
  customerName: string;
  totalPrice: number;
  itemCount: number;
  createdAt: string;
  isPriority: boolean;
}

/**
 * Type Guard: Check if object is a valid Order
 */
export const isValidOrder = (obj: any): obj is Order => {
  return (
    obj &&
    typeof obj === 'object' &&
    'id' in obj &&
    'orderNumber' in obj &&
    'orderFrom' in obj &&
    'customerId' in obj &&
    'businessId' in obj &&
    'items' in obj &&
    Array.isArray(obj.items)
  );
};

/**
 * Type Guard: Check if Order is from CUSTOMER
 */
export const isCustomerOrder = (order: Order): boolean => {
  return order.orderFrom === OrderFromEnum.CUSTOMER;
};

/**
 * Type Guard: Check if Order is from BUSINESS
 */
export const isBusinessOrder = (order: Order): boolean => {
  return order.orderFrom === OrderFromEnum.BUSINESS;
};
