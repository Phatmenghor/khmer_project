
// Product Info within Order Item
export interface OrderItemProductInfo {
  id: string;
  name: string;
  imageUrl: string;
  sku: string;
  barcode: string;
  sizeId: string | null;
  sizeName: string | null;
  status: string;
}

// Customization Detail in Order Item
export interface CustomizationDetail {
  productCustomizationId: string;
  name: string;
  priceAdjustment: number;
}

// Order Item Response
export interface OrderItemApiResponse {
  id: string;
  product: OrderItemProductInfo;
  quantity: number;
  currentPrice: number;
  finalPrice: number;
  totalPrice: number;

  // Promotion fields
  hasPromotion: boolean | null;
  promotionType: string | null;
  promotionValue: number | null;
  promotionFromDate: string | null;
  promotionToDate: string | null;

  // Customizations
  customizations: CustomizationDetail[];
  customizationTotal: number;
}

// User who changed status
export interface ChangedByUser {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  businessId: string;
  fullName: string;
}

// Order Status History Item
export interface OrderStatusHistoryItem {
  id: string;
  statusName: string;
  note: string;
  changedBy: ChangedByUser;
  changedAt: string;
}

// Delivery Address
export interface OrderDeliveryAddress {
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

// Delivery Option
export interface OrderDeliveryOption {
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
}

// Payment Info
export interface OrderPaymentInfo {
  paymentMethod: string;
  paymentStatus: string;
}

// Main Order Response
export interface OrderApiResponse {
  id: string;
  orderNumber: string;
  orderStatus: string;
  orderFrom: 'CUSTOMER' | 'BUSINESS';

  // Customer Info
  customerId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;

  // Business Info
  businessId: string;
  businessName: string;

  // Delivery Info
  deliveryAddress: OrderDeliveryAddress;
  deliveryOption: OrderDeliveryOption;

  // Notes
  customerNote: string | null;
  businessNote: string | null;

  // Order Items and Pricing
  items: OrderItemApiResponse[];
  subtotal: number;
  customizationTotal: number;
  deliveryFee: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;

  // Payment
  payment: OrderPaymentInfo;

  // Status History
  statusHistory: OrderStatusHistoryItem[];

  // Audit Fields
  createdAt: string;
  updatedAt: string;
}
