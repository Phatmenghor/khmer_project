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
 * Includes complete sales preview fields
 */
export interface ProductStockItemDto {
  // === BASIC IDENTIFICATION ===
  id: string;
  productId: string;
  productSizeId?: string;

  // === PRODUCT INFORMATION ===
  productName: string;
  description?: string;                    // Product description
  categoryId?: string;
  categoryName: string;
  brandId?: string;
  brandName: string;
  status: "ACTIVE" | "INACTIVE";

  // === IDENTIFICATION CODES ===
  sku: string;                             // CRITICAL: Never null
  barcode: string;                         // CRITICAL: Never null

  // === SIZE INFORMATION ===
  sizeName?: string;                       // null for PRODUCT type

  // === PRICING & PROMOTIONS ===
  price?: string;                          // Base selling price
  displayPrice?: number;                   // Final display price (after discount)
  displayPromotionType?: string;           // "PERCENTAGE" | "FIXED_AMOUNT"
  displayPromotionValue?: number;          // Discount percentage or amount
  displayPromotionFromDate?: string;       // Promotion start (ISO datetime)
  displayPromotionToDate?: string;         // Promotion end (ISO datetime)
  hasPromotion?: boolean;                  // Whether item is on sale

  // === INVENTORY INFORMATION ===
  totalStock: number;
  quantityAvailable?: number;              // Available = totalStock - reserved
  quantityReserved?: number;               // Already reserved/ordered
  quantityOnHand?: number;                 // Physical inventory

  // === STOCK STATUS ===
  stockStatus: "ENABLED" | "DISABLED";

  // === ITEM TYPE ===
  type: "PRODUCT" | "SIZE";

  // === IMAGES ===
  mainImageUrl?: string;                   // Main product image
  images?: ProductImage[];                 // Product image gallery

  // === ENGAGEMENT METRICS ===
  viewCount?: number;                      // View count
  favoriteCount?: number;                  // Favorite count

  // === METADATA ===
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
