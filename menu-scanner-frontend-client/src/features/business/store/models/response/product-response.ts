import { BasePagination } from "@/utils/common/pagination";
import { ProductCustomizationDto } from "./product-customization-response";
import { ImageUrls } from "@/features/auth/store/models/request/users-request";

export interface AllProductResponseModel extends BasePagination {
  content: ProductDetailResponseModel[];
}

export interface ProductDetailResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  name: string;
  description: string;
  status: string;
  price: string;
  promotionType: string;
  promotionValue: number;
  promotionFromDate: string;
  promotionToDate: string;
  displayPrice: number;
  displayOriginPrice: number;
  displayPromotionType: string;
  displayPromotionValue: number;
  displayPromotionFromDate: string;
  displayPromotionToDate: string;
  hasSizes: boolean;
  quantity: number;
  hasPromotion: boolean;
  mainImage: ImageUrls;
  viewCount: number;
  favoriteCount: number;
  isFavorited: boolean;
  businessId: string;
  businessName: string;
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  barcode: string;
  sku: string;

  stockStatus: string;
  totalStock: number;
  quantityAvailable: number;
  quantityReserved: number;
  quantityOnHand: number;
  images: ProductImage[];
  sizes: ProductSize[];
  customizations: ProductCustomizationDto[];
  isSelected?: boolean;
}

interface ProductImage {
  id: string;
  image: ImageUrls;
  displayOrder: number;
  createdAt: string;
}

export interface ProductSize {
  id: string;
  name: string;
  barcode: string;
  sku: string;
  price: number;
  promotionType: string;
  promotionValue: number;
  promotionFromDate: string;
  promotionToDate: string;
  finalPrice: number;
  hasPromotion: boolean;
  quantity: string;
  createdAt: string;

  totalStock: number;
  quantityAvailable: number;
  quantityReserved: number;
}
