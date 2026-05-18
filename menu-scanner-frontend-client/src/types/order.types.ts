


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


export interface OrderStatusHistoryEntry {
  status: OrderStatusEnum;
  changedAt: string;
  changedBy: string;
  note: string;
}


export interface OrderPricingDetails {
  totalItems: number;
  subtotalBeforeDiscount: number;
  subtotal: number;
  discountAmount: number;
  hasPromotion: boolean;
  promotionType: PromotionTypeEnum | null;
  promotionValue: number | null;
  deliveryFee: number;
  taxAmount: number;
  finalTotal: number;
}


export interface OrderPricing {
  before: OrderPricingDetails;
  after: OrderPricingDetails | null;
  hadOrderLevelChangeFromPOS: boolean;
  reason: string;
  discountPercent: number;
  taxPercent: number;
  currency: string;
}


export interface OrderPayment {
  id: string;
  paymentMethod: PaymentMethodEnum;
  paymentStatus: PaymentStatusEnum;
  paidAmount: number;
  changeAmount: number;
  paymentDate: string;
  transactionId: string;
  notes: string;
}


export interface OrderProduct {
  id: string;
  name: string;
  imageUrl: string;
  sizeId: string;
  sizeName: string;
  status: 'ACTIVE' | 'INACTIVE';
  category: string;
}


export interface OrderItemPricing {
  currentPrice: number;
  finalPrice: number;
  hasPromotion: boolean;
  quantity: number;
  totalBeforeDiscount: number;
  discountAmount: number;
  totalPrice: number;
  promotionType: PromotionTypeEnum;
  promotionValue: number;
  promotionFromDate: string;
  promotionToDate: string;
}


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


export interface DeviceInfo {
  deviceType: DeviceTypeEnum;
  osType: OSTypeEnum;
  appVersion: string;
  userAgent: string;
  ipAddress: string;
  timezone: string;
  language: string;
}


export interface Order {

  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;


  orderNumber: string;
  orderFrom: OrderFromEnum;


  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;


  businessId: string;
  businessName: string;


  deliveryAddress: DeliveryAddress;
  deliveryOption: DeliveryOption;


  orderStatus: OrderStatusEnum;
  orderStatusHistory: OrderStatusHistoryEntry[];


  customerNote: string;
  businessNote: string;


  pricing: OrderPricing;


  payment: OrderPayment;


  items: OrderItem[];


  estimatedDeliveryTime: string;
  actualDeliveryTime: string;


  isSpecialOrder: boolean;
  isPriority: boolean;
  source: OrderFromEnum;


  deviceInfo: DeviceInfo;


  isActive: boolean;
}


export interface CreateOrderRequest {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddressId: string;
  deliveryOptionId: string;
  customerNote: string;
  items: CreateOrderItemRequest[];
  orderFrom: OrderFromEnum;
}


export interface CreateOrderItemRequest {
  productId: string;
  productSizeId: string | null;
  quantity: number;
}


export interface OrderResponse {
  code: number;
  message: string;
  data: Order;
}


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


export const isCustomerOrder = (order: Order): boolean => {
  return order.orderFrom === OrderFromEnum.CUSTOMER;
};


export const isBusinessOrder = (order: Order): boolean => {
  return order.orderFrom === OrderFromEnum.BUSINESS;
};
