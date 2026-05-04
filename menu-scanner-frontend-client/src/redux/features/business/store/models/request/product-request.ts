import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface AllProductRequest extends BaseGetAllRequest {
  businessId?: string;
  categoryId?: string;
  subcategoryId?: string;
  brandId?: string;
  statuses?: string[];
  hasPromotion?: boolean;
  hasSize?: boolean;
  stockStatuses?: string[];
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductImageRequest {
  id?: string; // If exists, update; if not, create
  imageUrl: string;
}

export interface ProductSizeRequest {
  id?: string; // If exists, update; if not, create
  name: string;
  price: number;
  promotionType?: string;
  promotionValue?: number;
  promotionFromDate?: string;
  promotionToDate?: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  categoryId: string;
  subcategoryId?: string; // Optional
  brandId?: string; // Optional
  mainImageUrl: string;

  // Pricing - null if sizes exist
  price?: number | null;
  promotionType?: string | null;
  promotionValue?: number | null;
  promotionFromDate?: string | null;
  promotionToDate?: string | null;

  // Images and sizes
  images?: ProductImageRequest[];
  sizes?: ProductSizeRequest[];

  status: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  categoryId?: string;
  subcategoryId?: string; // Optional
  brandId?: string; // Optional
  mainImageUrl?: string;

  // Pricing - null if sizes exist
  price?: number | null;
  promotionType?: string | null;
  promotionValue?: number | null;
  promotionFromDate?: string | null;
  promotionToDate?: string | null;

  // Images and sizes
  // Missing items from original list will be deleted
  // Empty array removes all
  // Items with id are updates, without id are creates
  images?: ProductImageRequest[];
  sizes?: ProductSizeRequest[];

  status?: string;
}

export interface UpdateProductParams {
  productId: string;
  productData: UpdateProductRequest;
}
