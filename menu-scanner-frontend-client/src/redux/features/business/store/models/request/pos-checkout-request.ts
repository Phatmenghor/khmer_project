/**
 * POS Checkout Request Models
 * Simplified request DTOs without audit trail snapshots
 */

// Item in the cart — matches API specification
export interface POSCheckoutItemRequest {
  productId: string;
  productSizeId?: string | null;
  quantity: number;

  // Display fields
  productName?: string;
  productImageUrl?: string;
  sizeName?: string | null;
  status?: string;

  // Customizations - only IDs as per API spec
  customizationIds?: string[];

  // Pricing
  finalPrice?: number;
  totalPrice?: number;

  // SKU and barcode
  sku?: string;
  barcode?: string;
}

export interface DeliveryOptionRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
}

// Cart summary — matches API specification
export interface CartSummary {
  businessId: string;
  businessName?: string;
  items: POSCheckoutItemRequest[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
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

// Order-level pricing — matches API specification
export interface PricingInfo {
  deliveryFee: number;
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
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
