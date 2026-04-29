/**
 * POS Checkout Request Models
 * Simplified request DTOs without audit trail snapshots
 */

// Item in the cart — simplified without before/after
export interface POSCheckoutItemRequest {
  productId: string;
  productSizeId?: string | null;
  quantity: number;

  // Display fields
  productName?: string;
  productImageUrl?: string;
  sizeName?: string | null;
  status?: string;

  // Customizations/Add-ons - full details only (no duplicate IDs)
  customizations?: Array<{
    id: string;
    productCustomizationId: string;
    name: string;
    priceAdjustment: number;
  }>;

  // Pricing - final price only
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

// Cart summary — simplified
export interface CartSummary {
  businessId: string;
  businessName?: string;
  items: POSCheckoutItemRequest[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  customizationTotal: number;
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

// Order-level pricing — complete breakdown
export interface PricingInfo {
  // Base pricing
  subtotal: number;
  customizationTotal: number;
  deliveryFee: number;
  // Tax breakdown - for proper tax tracking and audit trail
  taxPercentage: number;
  taxAmount: number;
  // Optional: order-level discount (applied after tax)
  discountAmount: number;
  discountType?: "fixed" | "percentage" | null;
  discountReason?: string | null;
  // Final total
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
  // Pricing breakdown
  subtotal: number;
  customizationTotal?: number;
  deliveryFee: number;
  // Tax fields - must be present in response
  taxPercentage: number;
  taxAmount: number;
  // Discount
  discountAmount: number;
  // Final total
  totalAmount: number;
  // Order metadata
  orderStatus: string;
  source: string;
  paymentMethod: string;
  paymentStatus: string;
  createdBy: string;
  createdAt: string;
  customerName?: string;
  customerPhone?: string;
}
