


export const formatProductCount = (count: number | null | undefined): string => {
  const safeCount = count ?? 0;
  return safeCount <= 1 ? `${safeCount} Product` : `${safeCount} Products`;
};
