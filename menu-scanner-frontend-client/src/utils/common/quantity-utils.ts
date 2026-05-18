


export function getProductQuantity(product: any): number {
  return product?.quantity ?? 0;
}


export function getSizeQuantity(size: any): number {
  if (!size) return 0;
  const qty = size?.quantity;
  if (typeof qty === 'string') {
    return parseInt(qty, 10) || 0;
  }
  return qty || 0;
}


export function getDisplayQuantity(
  cartQuantity: number | undefined,
  apiQuantityInCart: number | undefined,
): number {
  return cartQuantity ?? apiQuantityInCart ?? 0;
}
