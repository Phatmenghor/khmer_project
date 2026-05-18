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
  /** Unique ID of this stock item (productSizeId if available, else productId) */
  id: string;

  /** ID of the product this stock belongs to */
  productId: string;

  /** ID of the product size variant (null/undefined if product has no sizes) */
  productSizeId?: string;

  // === PRODUCT INFORMATION ===
  /** Display name of the product */
  productName: string;

  /** Product description for sales preview */
  description?: string;

  /** Category unique ID */
  categoryId?: string;

  /** Category display name */
  categoryName: string;

  /** Brand unique ID */
  brandId?: string;

  /** Brand display name */
  brandName: string;

  /** Product status (ACTIVE/INACTIVE) */
  status: string;  // "ACTIVE" | "INACTIVE" or other status values

  // === IDENTIFICATION CODES ===
  /** Stock Keeping Unit - MUST NOT BE NULL */
  sku: string;

  /** Product barcode - MUST NOT BE NULL */
  barcode: string;

  // === SIZE INFORMATION ===
  /** Display name of the size variant (null/undefined if product has no sizes) */
  sizeName?: string;

  // === PRICING & PROMOTIONS ===
  /** Base selling price (as string for decimal precision) */
  price?: string;

  /** Final display price after discount */
  displayPrice?: number;

  /** Promotion type (PERCENTAGE or FIXED_AMOUNT) */
  displayPromotionType?: string;

  /** Discount value (percentage or fixed amount) */
  displayPromotionValue?: number;

  /** Promotion valid from date/time (ISO datetime) */
  displayPromotionFromDate?: string;

  /** Promotion valid to date/time (ISO datetime) */
  displayPromotionToDate?: string;

  /** Flag indicating if item is on promotion */
  hasPromotion?: boolean;

  // === INVENTORY INFORMATION ===
  /** Total quantity in stock (aggregated from all batches) */
  totalStock: number;

  /** Quantity available for sale (totalStock - reserved) */
  quantityAvailable?: number;

  /** Quantity already reserved/ordered */
  quantityReserved?: number;

  /** Physical units in hand */
  quantityOnHand?: number;

  // === STOCK STATUS ===
  /** Stock tracking status (ENABLED/DISABLED) */
  stockStatus: string;  // "ENABLED" | "DISABLED" or other status values

  // === ITEM TYPE ===
  /** Type of item (PRODUCT or SIZE) */
  type: "PRODUCT" | "SIZE";

  // === IMAGES ===
  /** Main product image URL */
  mainImageUrl?: string;

  /** Product images gallery */
  images?: ProductImage[];

  // === ENGAGEMENT METRICS ===
  /** Total number of product views */
  viewCount?: number;

  /** Total number of times favorited */
  favoriteCount?: number;

  // === METADATA ===
  /** Timestamp when this stock item was created */
  createdAt: string;

  /** Timestamp when this stock item was last updated */
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
