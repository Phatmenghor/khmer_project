export interface ToggleFavoriteRequest {
  productId: string;
  isFavorited: boolean; // current state before toggle, so slice knows direction
}
