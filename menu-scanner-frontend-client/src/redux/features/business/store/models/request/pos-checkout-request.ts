/**
 * POS Checkout Request/Response Models
 * Similar to customer checkout but with admin capabilities
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
  customerId?: string;  // Optional - admin can create for existing customer
  customerName?: string;
  customerPhone?: string;

  // Items with POS pricing control
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

  // POS-specific options
  adminId?: string;  // Who created this order from POS
  autoConfirmStatus?: boolean;  // If true, status goes CONFIRMED, else PENDING
  discountAmount?: number;
  taxAmount?: number;
}

export interface POSCheckoutResponse {
  id: string;
  orderNumber: string;
  total: number;
  orderStatus: string;
  source: 'POS';  // Always POS for this endpoint
  createdBy: string;
  createdAt: string;
}
