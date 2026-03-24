/**
 * POS Page - Type Definitions
 */

import { ProductDetailResponseModel } from "../response/product-response";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { DeliveryOptionsResponseModel } from "@/redux/features/master-data/store/models/response/delivery-options-response";

// ─── Cart Item ───
export interface PosPageCartItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  productSizeId: string | null;
  sizeName: string | null;
  currentPrice: number;
  finalPrice: number;
  hasActivePromotion: boolean;
  quantity: number;
  promotionType: string | null;
  promotionValue: number | null;
  promotionFromDate: string | null;
  promotionToDate: string | null;
}

// ─── State ───
export interface POSPageState {
  // Payment & Delivery
  selectedDeliveryOption: DeliveryOptionsResponseModel | null;
  selectedPaymentOption: any;

  // Products & Filters
  products: ProductDetailResponseModel[];
  productsLoading: boolean;
  searchTerm: string;
  selectedCategory: CategoriesResponseModel | null;
  selectedBrand: BrandResponseModel | null;
  categories: CategoriesResponseModel[];
  brands: BrandResponseModel[];
  categoriesLoading: boolean;
  brandsLoading: boolean;
  productPage: number;
  hasMoreProducts: boolean;

  // Cart
  cartItems: PosPageCartItem[];
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
