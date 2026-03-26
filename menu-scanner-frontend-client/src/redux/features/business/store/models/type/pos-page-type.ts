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

// ─── Cart Item with Audit Trail ───
export interface PosPageCartItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  productSizeId: string | null;
  sizeName: string | null;

  // ===== AUDIT TRAIL =====
  // Before: Original pricing from product
  before: ItemPricingSnapshot;

  // Was item modified from POS?
  hadChangeFromPOS: boolean;

  // After: Final pricing after all POS changes
  after: ItemPricingSnapshot;

  // Reason for changes (if any)
  reason?: string;
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

// ─── Order Pricing with Audit Trail ───
export interface OrderPricingWithAuditTrail {
  // Before: Pricing before order-level discount
  before: OrderPricingSnapshot;

  // Was order total modified?
  hadOrderLevelChangeFromPOS: boolean;

  // After: Pricing after order-level discount
  after: OrderPricingSnapshot;

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
  cartItems: PosPageCartItem[];              // Items with before/after snapshots
  cartPricing: OrderPricingWithAuditTrail | null;  // Order total with before/after
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
