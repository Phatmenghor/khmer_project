/**
 * POS Checkout Request/Response Models
 *
 * Unified checkout structure for both PUBLIC (customer) and POS (admin) orders
 * For coffee shop POS: Order is COMPLETE when created
 * All details filled in by shop staff → Ready to prepare immediately
 *
 * Audit Trail: Tracks before/after values for item modifications
 * - Business can review what prices were changed
 * - Business can review what promotions were applied
 * - Timestamp and user tracking for accountability
 */

// Item audit trail for tracking modifications
export interface ItemAuditTrail {
  originalPrice: number;
  overriddenPrice: number;
  originalPromotion?: { type: string | null; value: number | null };
  appliedPromotion?: { type: string | null; value: number | null };
  modifiedAt?: string;
  modifiedBy?: string;
  reason?: string; // Why was it changed
}

export interface POSCheckoutItemRequest {
  id?: string; // Cart item ID for tracking
  productId: string;
  productSizeId?: string | null;
  quantity: number;

  // Display fields
  productName?: string;
  productImageUrl?: string;
  sizeName?: string | null;
  status?: string;

  // Current/original prices from product
  currentPrice?: number; // Original product price
  finalPrice?: number; // Price after any product promotions
  hasActivePromotion?: boolean;

  // Admin can override pricing & apply custom promotions
  overridePrice?: number; // Admin override price
  promotionType?: string | null; // PERCENTAGE or FIXED_AMOUNT
  promotionValue?: number | null;

  // Totals
  totalBeforeDiscount?: number; // quantity * currentPrice
  discountAmount?: number; // quantity * (currentPrice - finalPrice)
  totalPrice?: number; // quantity * finalPrice (or overridden price)

  // Audit trail - shows before/after modifications
  auditTrail?: ItemAuditTrail[];
}

export interface DeliveryOptionRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
}

export interface CartSummary {
  businessId: string;
  businessName?: string;
  items: POSCheckoutItemRequest[];

  totalItems: number;
  totalQuantity: number;
  subtotalBeforeDiscount: number; // Sum of all item currentPrice * quantity
  subtotal: number; // Sum of all item finalPrice * quantity (after product promotions)
  totalDiscount: number; // Sum of all discounts from product promotions
  finalTotal: number; // subtotal + delivery + tax
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

export interface PaymentInfo {
  paymentMethod: string; // CASH only for now
  paymentStatus?: string; // PAID, UNPAID, etc.
}

export interface POSCheckoutRequest {
  // Order basics
  businessId: string;
  customerId?: string; // Optional - for registered customer
  customerName?: string;
  customerPhone?: string;

  // Full delivery details (like public checkout)
  deliveryAddress: POSCheckoutAddressRequest;
  deliveryOption: DeliveryOptionRequest;

  // Full cart with all item details and audit trail
  cart: CartSummary;

  // Payment (CASH only)
  payment: PaymentInfo;

  // Notes
  customerNote?: string;
  businessNote?: string;

  // Order status
  orderStatus?: string; // PENDING, CONFIRMED, etc. (POS always COMPLETED)
}

export interface POSCheckoutResponse {
  id: string;
  orderNumber: string;

  // Totals as stored in backend
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;

  // Order tracking
  orderStatus: string; // Always COMPLETED for POS
  source: string; // Always POS
  paymentMethod: string;
  paymentStatus: string; // PAID for POS orders

  // Audit info
  createdBy: string;
  createdAt: string;
  customerName?: string;
  customerPhone?: string;

  // Items with audit trail preserved
  items?: POSCheckoutItemRequest[];
}

