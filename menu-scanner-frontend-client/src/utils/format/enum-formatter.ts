export const formatEnumValue = (value: string | null | undefined): string => {
  if (!value) return "---";
  
  return value
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const unformatEnumValue = (value: string): string => {
  return value.replace(/\s+/g, "_").toUpperCase();
};
