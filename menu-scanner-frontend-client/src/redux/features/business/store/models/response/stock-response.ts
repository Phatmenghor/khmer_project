export interface ProductStockDto {
  id: string;
  businessId: string;
  productId: string;
  productSizeId: string;
  productName: string;
  sizeName: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  priceIn: number;
  dateIn: string;
  expiryDate: string;
  location: string;
  status: string;
  isExpired: boolean;
  isOutOfStock: boolean;
  inventoryValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductStockListResponse {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  content: ProductStockDto[];
}

/**
 * DTO for product stock items listing
 * Represents a product or product-size with aggregated stock information
 */
export interface ProductStockItemDto {
  id: string;
  productId: string;
  productSizeId?: string;
  productName: string;
  categoryName: string;
  brandName: string;
  sku: string;
  barcode: string;
  sizeName?: string;  // null for PRODUCT type
  totalStock: number;
  status: "ACTIVE" | "INACTIVE";
  stockStatus: "ENABLED" | "DISABLED";
  type: "PRODUCT" | "SIZE";
  createdAt: string;
  updatedAt: string;
}

export interface ProductStockItemsListResponse {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  content: ProductStockItemDto[];
}
