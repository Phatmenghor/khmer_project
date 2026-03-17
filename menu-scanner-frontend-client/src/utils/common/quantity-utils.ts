/**
 * Quantity naming standardization utilities
 *
 * Standard names throughout the codebase (frontend & backend aligned):
 * - `quantity`: The actual quantity of an item in the cart (CartItemModel.quantity, ProductDetailDto.quantity)
 * - `totalQuantity`: Sum of all item quantities in cart (CartState.totalItems)
 * - `displayQuantity`: Quantity shown in UI (includes pending/unsaved edits)
 *
 * Backend DTOs now use 'quantity' consistently:
 * - CartItemResponse.quantity
 * - ProductDetailDto.quantity
 * - ProductListDto.quantity
 * - ProductSizeDto.quantity
 */

/**
 * Extract quantity from product API response
 * Backend now consistently returns 'quantity' field
 */
export function getProductQuantity(product: any): number {
  return product?.quantity ?? 0;
}

/**
 * Extract quantity from product size
 * Backend now returns quantity as string in ProductSizeDto
 */
export function getSizeQuantity(size: any): number {
  if (!size) return 0;
  const qty = size?.quantity;
  if (typeof qty === 'string') {
    return parseInt(qty, 10) || 0;
  }
  return qty || 0;
}

/**
 * Get display quantity - use cart quantity if available, fallback to API quantityInCart
 */
export function getDisplayQuantity(
  cartQuantity: number | undefined,
  apiQuantityInCart: number | undefined,
): number {
  return cartQuantity ?? apiQuantityInCart ?? 0;
}

/**
 * Standardized quantity variable names for components:
 * - quantity: Current quantity from Redux cart (CartItemModel.quantity)
 * - totalQuantity: Sum of all quantities (CartState.totalItems)
 * - displayQuantity: What's shown in UI (may include pending changes)
 * - pendingQuantity: Unsaved edits before API sync
 *
 * Example usage in component:
 * const quantity = cartItem?.quantity ?? 0;  // From Redux
 * const totalQuantity = cartItems.reduce(...);  // Sum
 * const displayQuantity = hasPendingEdit ? pendingQty : quantity;  // UI display
 */
