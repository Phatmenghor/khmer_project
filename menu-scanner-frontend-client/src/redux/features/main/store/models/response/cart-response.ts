export interface CartResponseModel {
  items: CartItemModel[];
  totalItems: number;                 // Number of unique products
  totalQuantity?: number;              // Total quantity across all items
  subtotalBeforeDiscount?: number;  // Original price total (currentPrice * qty)
  subtotal: number;                  // Final price total before shipping/fees
  totalDiscount: number;              // Total discount applied
  finalTotal: number;                 // Final total (subtotal + shipping/fees)
}

export interface CartItemModel {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  productSizeId: string | null;
  sizeName: string | null;
  status?: string;  // ACTIVE, INACTIVE, OUT_OF_STOCK
  currentPrice: number;
  finalPrice: number;
  hasActivePromotion?: boolean;
  hasPromotion?: boolean;  // For backward compatibility
  quantity: number;
  totalPrice: number;
  isAvailable?: boolean;  // Can be derived from status
  promotionType: string | null;
  promotionValue: number | null;
  promotionEndDate: string | null;
  promotionFromDate: string | null;
  promotionToDate: string | null;
  totalBeforeDiscount?: number;
  discountAmount?: number;
  lastOptimisticTimestamp?: number;
  sku?: string;  // Product SKU from store master data
  barcode?: string;  // Product barcode from store master data
}

// Backward compatible alias
export type CartItemResponseModel = CartItemModel;
