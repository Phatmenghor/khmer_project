export interface ProductStockDto {
  id: string;
  businessId: string;
  productId: string;
  productName: string;
  productSizeId?: string;
  productSizeName?: string;
  quantityOnHand: number;
  priceIn: number;
  expiryDate?: string;
  location?: string;
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
