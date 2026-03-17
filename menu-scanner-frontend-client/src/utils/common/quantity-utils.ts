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
 * Handles both 'quantity' and 'quantityInCart' for backward compatibility
 * (frontend is ready for backend update, but also works with current API)
 */
export function getProductQuantity(product: any): number {
  // Try new field first, fallback to old field for backward compatibility
  return product?.quantity ?? product?.quantityInCart ?? 0;
}

/**
 * Extract quantity from product size
 * Backend now returns quantity as string in ProductSizeDto
 * Handles both 'quantity' and 'quantityInCart' for backward compatibility
 */
export function getSizeQuantity(size: any): number {
  if (!size) return 0;
  // Try new field first, fallback to old field
  const qty = size?.quantity ?? size?.quantityInCart;
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
