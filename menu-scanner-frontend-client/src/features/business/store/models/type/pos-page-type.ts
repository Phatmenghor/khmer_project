


import { ProductDetailResponseModel } from "../response/product-response";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
import { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import { DeliveryOptionsResponseModel } from "@/features/master-data/store/models/response/delivery-options-response";
import { OrderResponse } from "@/features/main/store/models/response/order-response";


export interface PosPageCartItemCustomization {
  id: string;
  productCustomizationId: string;
  name: string;
  priceAdjustment: number;
}


export interface PosPageCartItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  productSizeId: string | null;
  sizeName: string | null;
  quantity: number;


  sku?: string;
  barcode?: string;


  customizations?: PosPageCartItemCustomization[];


  currentPrice: number;
  finalPrice: number;
  totalPrice: number;


  hasPromotion?: boolean | string;
  promotionType?: string | null;
  promotionValue?: number | null;
  promotionFromDate?: string | null;
  promotionToDate?: string | null;
  editReason?: string;
}


export interface CartPricingInfo {
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  taxAmount: number;
  finalTotal: number;
}


export interface POSPageState {

  selectedDeliveryOption: DeliveryOptionsResponseModel | null;
  selectedPaymentOption: any;


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


  cartItems: PosPageCartItem[];
  cartPricing: CartPricingInfo | null;
  showCart: boolean;


  customerNote: string;
  isSubmitting: boolean;


  sizePickerProduct: ProductDetailResponseModel | null;
  editingCartItemId: string | null;
  lastSelectedCustomizations: Record<string, string[]>;
  successOrder: OrderResponse | null;
  showOrderDetailsModal: boolean;


  brandOpen: boolean;
  categoryOpen: boolean;
  promotionFilter: boolean | undefined;
  promotionOpen: boolean;
  minPrice?: string;
  maxPrice?: string;
}
