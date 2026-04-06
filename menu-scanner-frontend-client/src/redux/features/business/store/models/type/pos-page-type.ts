/**
 * POS Page - Type Definitions with Audit Trail
 * Tracks before/after snapshots for complete order history
 */

import { ProductDetailResponseModel } from "../response/product-response";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { DeliveryOptionsResponseModel } from "@/redux/features/master-data/store/models/response/delivery-options-response";

// ─── Item Pricing Snapshot (before or after) ───
export interface ItemPricingSnapshot {
  currentPrice: number;           // Base price before promotion
  finalPrice: number;             // Price after promotion
  hasActivePromotion: boolean;
  quantity: number;
  totalBeforeDiscount: number;    // currentPrice × quantity
  discountAmount: number;         // (currentPrice - finalPrice) × quantity
  totalPrice: number;             // finalPrice × quantity
  promotionType: string | null;   // PERCENTAGE or FIXED_AMOUNT
  promotionValue: number | null;
  promotionFromDate: string | null;
  promotionToDate: string | null;
}

// ─── Item Audit Trail Metadata ───
export interface ItemAuditTrailMetadata {
  // Type of change made
  changeType:
    | "PRICE_OVERRIDE"           // Admin changed base price
    | "PROMOTION_APPLIED"        // Promotion was added/modified
    | "QUANTITY_CHANGED"         // Quantity was modified
    | "COMBINED";                // Multiple changes

  // Discount details (if discount was applied)
  discountType?: "FIXED_AMOUNT" | "PERCENTAGE" | null;
  discountValue?: number | null;  // $ amount or % value

  // Original price before any changes
  originalPrice: number;

  // Updated/final price after all changes
  updatedPrice: number;

  // Human-readable reason
  reason: string;

  // Timestamp of change
  changedAt?: string;
}

// ─── Cart Item with Audit Trail ───
export interface PosPageCartItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  productSizeId: string | null;
  sizeName: string | null;

  // Top-level quantity for UI controls (mirrors after.quantity)
  quantity: number;

  // SKU and barcode for store tracking
  sku?: string;
  barcode?: string;

  // ===== AUDIT TRAIL =====
  // Before: Original pricing from product (immutable once set)
  before: ItemPricingSnapshot;

  // Was item modified from POS?
  hadChangeFromPOS: boolean;

  // After: Current pricing after all POS changes
  after: ItemPricingSnapshot;
}

// ─── Order Pricing Snapshot (before or after) ───
export interface OrderPricingSnapshot {
  totalItems: number;
  subtotalBeforeDiscount: number;  // Sum of all items original price
  subtotal: number;                // After item-level discounts
  totalDiscount: number;           // Total from items
  deliveryFee: number;
  taxAmount: number;
  finalTotal: number;              // Total to pay
}

// ─── Order Discount Metadata ───
export interface OrderDiscountMetadata {
  // Type of order-level discount
  discountType: "FIXED_AMOUNT" | "PERCENTAGE";

  // Discount value ($ amount or % value)
  discountValue: number;

  // Total before discount
  beforeTotal: number;

  // Total after discount
  afterTotal: number;

  // Actual amount saved
  amountSaved: number;

  // Human-readable reason
  reason: string;

  // Timestamp of discount application
  appliedAt?: string;
}

// ─── Order Pricing with Audit Trail ───
export interface OrderPricingWithAuditTrail {
  // Before: Pricing before order-level discount
  before: OrderPricingSnapshot;

  // Was order total modified?
  hadOrderLevelChangeFromPOS: boolean;

  // After: Pricing after order-level discount
  after: OrderPricingSnapshot;

  // Detailed discount metadata (if applied)
  discountMetadata?: OrderDiscountMetadata;

  // Reason for order-level change
  orderLevelChangeReason?: string;
}

// ─── State ───
export interface POSPageState {
  // Payment & Delivery
  selectedDeliveryOption: DeliveryOptionsResponseModel | null;
  selectedPaymentOption: any;

  // Products & Filters
  products: ProductDetailResponseModel[];
  productsLoading: boolean;
  productsError: string | null;
  searchTerm: string;
  selectedCategory: CategoriesResponseModel | null;
  selectedBrand: BrandResponseModel | null;
  categories: CategoriesResponseModel[];
  brands: BrandResponseModel[];
  categoriesLoading: boolean;
  brandsLoading: boolean;
  productPage: number;
  hasMoreProducts: boolean;

  // Cart with Audit Trail
  cartItems: PosPageCartItem[];
  cartPricing: OrderPricingWithAuditTrail | null;
  showCart: boolean;

  // Order
  customerNote: string;
  isSubmitting: boolean;

  // Modals
  sizePickerProduct: ProductDetailResponseModel | null;
  editingCartItemId: string | null;
  successOrder: { orderNumber: string; total: number } | null;
  showOrderDetailsModal: boolean;

  // UI
  brandOpen: boolean;
  promotionFilter: boolean | undefined;
  promotionOpen: boolean;
}
