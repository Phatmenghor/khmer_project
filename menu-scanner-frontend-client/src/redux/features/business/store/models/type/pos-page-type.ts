/**
 * POS Page - Type Definitions
 * Simplified pricing without audit trail snapshots
 */

import { ProductDetailResponseModel } from "../response/product-response";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { SubcategoriesResponseModel } from "@/redux/features/master-data/store/models/response/subcategories-response";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { DeliveryOptionsResponseModel } from "@/redux/features/master-data/store/models/response/delivery-options-response";

// ─── Cart Item Customization ───
export interface PosPageCartItemCustomization {
  id: string;
  productCustomizationId: string;
  name: string;
  priceAdjustment: number;
}

// ─── Cart Item ───
export interface PosPageCartItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  productSizeId: string | null;
  sizeName: string | null;
  quantity: number;

  // SKU and barcode for store tracking
  sku?: string;
  barcode?: string;

  // Customizations/Add-ons selected for this item
  customizations?: PosPageCartItemCustomization[];

  // Pricing
  currentPrice: number;
  finalPrice: number;
  totalPrice: number;
}

// ─── Cart Pricing ───
export interface CartPricingInfo {
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  taxAmount: number;
  finalTotal: number;
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
  selectedSubcategory: SubcategoriesResponseModel | null;
  selectedBrand: BrandResponseModel | null;
  categories: CategoriesResponseModel[];
  subcategories: SubcategoriesResponseModel[];
  brands: BrandResponseModel[];
  categoriesLoading: boolean;
  subcategoriesLoading: boolean;
  brandsLoading: boolean;
  productPage: number;
  hasMoreProducts: boolean;

  // Cart
  cartItems: PosPageCartItem[];
  cartPricing: CartPricingInfo | null;
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
  subcategoryOpen: boolean;
  promotionFilter: boolean | undefined;
  promotionOpen: boolean;
}
