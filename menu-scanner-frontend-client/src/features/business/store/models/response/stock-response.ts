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


export interface ProductStockItemDto {


  id: string;


  productId: string;


  productSizeId?: string;


  productName: string;


  description?: string;


  categoryId?: string;


  categoryName: string;


  brandId?: string;


  brandName: string;


  status: string;


  sku: string;


  barcode: string;


  sizeName?: string;


  price?: string;


  displayPrice?: number;


  displayPromotionType?: string;


  displayPromotionValue?: number;


  displayPromotionFromDate?: string;


  displayPromotionToDate?: string;


  hasPromotion?: boolean;


  totalStock: number;


  quantityAvailable?: number;


  quantityReserved?: number;


  quantityOnHand?: number;


  stockStatus: string;


  type: "PRODUCT" | "SIZE";


  mainImageUrl?: string;


  images?: ProductImage[];


  viewCount?: number;


  favoriteCount?: number;


  createdAt: string;


  updatedAt: string;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  displayOrder?: number;
}

export interface ProductStockItemsListResponse {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  content: ProductStockItemDto[];
}
