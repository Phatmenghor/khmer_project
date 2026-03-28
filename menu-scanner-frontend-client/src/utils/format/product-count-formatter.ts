/**
 * Format product count with proper singular/plural
 * 0 or null -> "0 Product"
 * 1 -> "1 Product"
 * 2+ -> "X Products"
 */
export const formatProductCount = (count: number | null | undefined): string => {
  const safeCount = count ?? 0;
  return safeCount <= 1 ? `${safeCount} Product` : `${safeCount} Products`;
};
