const UNREACHABLE_IMAGE_DOMAINS = ["via.placeholder.com"];

/**
 * Returns the fallback image path when the given URL belongs to a known
 * unreachable / placeholder domain, preventing server-side fetch failures.
 */
export function sanitizeImageUrl(
  url: string | null | undefined,
  fallback: string
): string {
  if (!url) return fallback;
  if (UNREACHABLE_IMAGE_DOMAINS.some((domain) => url.includes(domain))) {
    return fallback;
  }
  return url;
}

export function toRoman(num: number): string {
  const roman = [
    "M",
    "CM",
    "D",
    "CD",
    "C",
    "XC",
    "L",
    "XL",
    "X",
    "IX",
    "V",
    "IV",
    "I",
  ];
  const value = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  let result = "";
  for (let i = 0; i < value.length; i++) {
    while (num >= value[i]) {
      result += roman[i];
      num -= value[i];
    }
  }
  return result;
}

export function formatValue(value: any) {
  return value === null || value === undefined || value === "" ? "---" : value;
}

export const indexDisplay = (
  pageNo?: number,
  pageSize?: number,
  index?: number
) => {
  return ((pageNo || 1) - 1) * (pageSize || 15) + (index || 1);
};
