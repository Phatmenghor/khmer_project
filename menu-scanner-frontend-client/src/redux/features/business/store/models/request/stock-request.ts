import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface ProductStockCreateRequest {
  businessId: string;
  productId: string;
  productSizeId?: string;
  quantityOnHand: number;
  priceIn: number;
  expiryDate?: string;
  location?: string;
}

export interface ProductStockUpdateRequest {
  quantityOnHand?: number;
  priceIn?: number;
  expiryDate?: string;
  location?: string;
}

export interface ProductStockFilterRequest extends BaseGetAllRequest {
  businessId?: string;
  productId?: string;
  search?: string;
}
