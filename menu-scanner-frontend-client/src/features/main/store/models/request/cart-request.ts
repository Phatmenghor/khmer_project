export interface AddToCartRequest {
  productId: string;
  productSizeId?: string | null;
  quantity: number;
  customizationIds?: string[];
  optimisticTimestamp?: number;
}

export interface UpdateCartItemRequest {
  productId: string;
  productSizeId?: string | null;
  quantity: number;
  customizationIds?: string[];
  optimisticTimestamp?: number;
}
