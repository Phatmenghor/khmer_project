/**
 * POS Checkout Request/Response Models
 *
 * For coffee shop POS: Order is COMPLETE when created
 * All details filled in by shop staff → Ready to prepare immediately
 */

export interface POSCheckoutItemRequest {
  productId: string;
  productSizeId?: string | null;
  quantity: number;
  // Admin can override pricing
  overridePrice?: number;
  promotionType?: string | null;
  promotionValue?: number | null;
  // Display fields
  productName?: string;
  productImageUrl?: string;
  sizeName?: string | null;
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

export interface POSCheckoutRequest {
  // Order basics
  businessId: string;
  customerId?: string;  // Optional - for registered customer
  customerName?: string;
  customerPhone?: string;

  // Items with admin pricing control
  items: POSCheckoutItemRequest[];

  // Delivery
  deliveryOptionId: string;
  deliveryAddress: POSCheckoutAddressRequest;

  // Payment (CASH only)
  paymentMethod: string;

  // Order totals
  subtotal?: number;
  discountAmount?: number;
  deliveryFee?: number;
  taxAmount?: number;
  totalAmount?: number;

  // Notes
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

