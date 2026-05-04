import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface ProductStockCreateRequest {
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
  productSizeId?: string;
  search?: string;
}

/**
 * Type-safe filter request for product stock items listing
 * Uses easy field names: totalStock, productName, etc.
 * Default sorting: totalStock DESC (high to low)
 */
export interface ProductStockItemsFilterRequest {
  pageNo?: number;
  pageSize?: number;
  sortBy?: "totalStock" | "productName" | "categoryName" | "brandName" | "sku" | "barcode" | "sizeName" | "status" | "stockStatus" | "createdAt" | "updatedAt";
  sortDirection?: "ASC" | "DESC";
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
  stockStatus?: "ENABLED" | "DISABLED";
  lowStockThreshold?: number;
  hasSizes?: boolean;
}
