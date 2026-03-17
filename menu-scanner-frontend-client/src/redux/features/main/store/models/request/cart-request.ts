export interface AddToCartRequest {
  productId: string;
  productSizeId?: string | null;
  quantity: number;
  optimisticTimestamp?: number;
}

export interface UpdateCartItemRequest {
  productId: string;
  productSizeId?: string | null;
  quantity: number;
  optimisticTimestamp?: number;
}
