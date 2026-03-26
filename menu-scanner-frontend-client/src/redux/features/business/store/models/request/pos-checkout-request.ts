/**
 * POS Checkout Request/Response Models
 *
 * For coffee shop POS: Order is COMPLETE when created
 * All details filled in by shop staff → Ready to prepare immediately
 */

export interface POSCheckoutItemRequest {
  productId: string;
  sizeId?: string | null;
  quantity: number;
  // Admin can override pricing
  overridePrice?: number;
  promotionType?: string | null;
  promotionValue?: number | null;
}

export interface POSCheckoutAddressRequest {
  village: string;
  commune: string;
  district: string;
  province: string;
  streetNumber: string;
  houseNumber: string;
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

  // Payment
  paymentMethodId: string;
  paymentStatus?: 'PENDING' | 'PAID' | 'UNPAID' | 'PARTIALLY_PAID';

  // Notes
  customerNote?: string;
  businessNote?: string;

  // Optional
  discountAmount?: number;
  taxAmount?: number;
}

export interface POSCheckoutResponse {
  id: string;
  orderNumber: string;
  total: number;
  orderStatus: 'COMPLETED';   // All order data is complete/finalized
  source: 'POS';              // Always POS
  createdBy: string;
  createdAt: string;
}

