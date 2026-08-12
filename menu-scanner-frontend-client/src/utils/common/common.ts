export function formatEnumLabel(value?: string | null): string | undefined {
  if (!value) return undefined;
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

import { ImageUrls } from "@/features/auth/store/models/request/users-request";

const UNREACHABLE_IMAGE_DOMAINS = ["via.placeholder.com"];

export function getProductImageUrl(imageUrl?: string | ImageUrls | null): string {
  if (!imageUrl) return "";
  if (typeof imageUrl === "string") return imageUrl;
  return imageUrl.md || imageUrl.sm || imageUrl.o || "";
}


export function sanitizeImageUrl(
  url: string | { sm?: string; md?: string; o?: string } | null | undefined,
  fallback: string
): string {
  if (!url) return fallback;

  let targetUrl: string | undefined;
  if (typeof url === "string") {
    targetUrl = url;
  } else if (typeof url === "object" && url !== null) {
    targetUrl = url.sm || url.md || url.o;
  }

  if (!targetUrl || typeof targetUrl !== "string") return fallback;

  if (UNREACHABLE_IMAGE_DOMAINS.some((domain) => targetUrl!.includes(domain))) {
    return fallback;
  }
  return targetUrl;
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

export function formatValue(value: unknown) {
  return value === null || value === undefined || value === "" ? "---" : value;
}

export const indexDisplay = (
  pageNo?: number,
  pageSize?: number,
  index?: number
) => {
  return ((pageNo || 1) - 1) * (pageSize || 15) + (index || 1);
};

export interface SimpleAddress {
  houseNumber?: string;
  streetNumber?: string;
  village?: string;
  commune?: string;
  district?: string;
  province?: string;
  country?: string;
}

export function formatAddress(address?: SimpleAddress | null): string {
  if (!address) return "";
  return [
    address.houseNumber,
    address.streetNumber ? `St. ${address.streetNumber}` : null,
    address.village,
    address.commune,
    address.district,
    address.province,
  ]
    .filter(Boolean)
    .join(", ");
}
