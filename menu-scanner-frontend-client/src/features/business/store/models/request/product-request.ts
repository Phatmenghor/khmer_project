import { BaseGetAllRequest } from "@/utils/common/get-all-request";
import { ImageUrls } from "@/features/auth/store/models/request/users-request";

export interface AllProductRequest extends BaseGetAllRequest {
  businessId?: string;
  categoryId?: string;
  brandId?: string;
  statuses?: string[];
  hasPromotion?: boolean;
  hasSize?: boolean;
  stockStatuses?: string[];
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductImageRequest {
  id?: string;
  image: ImageUrls;
}

export interface ProductSizeRequest {
  id?: string;
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
  brandId?: string;
  mainImage: ImageUrls;


  price?: number | null;
  promotionType?: string | null;
  promotionValue?: number | null;
  promotionFromDate?: string | null;
  promotionToDate?: string | null;


  images?: ProductImageRequest[];
  sizes?: ProductSizeRequest[];

  status: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  categoryId?: string;
  brandId?: string;
  mainImage?: ImageUrls;


  price?: number | null;
  promotionType?: string | null;
  promotionValue?: number | null;
  promotionFromDate?: string | null;
  promotionToDate?: string | null;


  images?: ProductImageRequest[];
  sizes?: ProductSizeRequest[];

  status?: string;
}

export interface UpdateProductParams {
  productId: string;
  productData: UpdateProductRequest;
}
