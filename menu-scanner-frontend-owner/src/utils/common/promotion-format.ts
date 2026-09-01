import { formatCurrency } from "./currency-format";

/**
 * Returns a long-form description for a promotion (e.g. "10% OFF", "$2.00 OFF", "Sale").
 */
export function getPromotionLabel(
  hasPromotion: boolean | string | undefined | null,
  promotionType: string | undefined | null,
  promotionValue: number | undefined | null
): string | null {
  const isActive =
    hasPromotion === true ||
    hasPromotion === "ACTIVE" ||
    hasPromotion === "true";

  if (!isActive) return null;

  if (promotionType === "PERCENTAGE") {
    return `${promotionValue ?? 0}% OFF`;
  }

  if (promotionType === "FIXED_AMOUNT") {
    return `${formatCurrency(promotionValue ?? 0)} OFF`;
  }

  return "Sale";
}

/**
 * Returns a short-form badge text for a promotion (e.g. "-10%", "-$2.00").
 */
export function getPromotionBadgeText(
  hasPromotion: boolean | string | undefined | null,
  promotionType: string | undefined | null,
  promotionValue: number | undefined | null
): string | null {
  const isActive =
    hasPromotion === true ||
    hasPromotion === "ACTIVE" ||
    hasPromotion === "true";

  if (!isActive) return null;

  if (promotionType === "PERCENTAGE") {
    return `-${promotionValue ?? 0}%`;
  }

  return `-${formatCurrency(promotionValue ?? 0)}`;
}
