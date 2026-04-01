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
