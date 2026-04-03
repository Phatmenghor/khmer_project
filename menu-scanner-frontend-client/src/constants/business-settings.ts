/**
 * Business Settings Constants
 * Default values used when business settings are null or not provided
 */

export const BUSINESS_SETTINGS_DEFAULTS = {
  // Default business name
  BUSINESS_NAME: "Emenu Scanner",

  // Default brand colors (hex format)
  // Primary: Green #57823D, Secondary: Golden Yellow #F4C430, Accent: Light Grey #F2F3F7
  PRIMARY_COLOR: "#57823D",    // Green - brand color
  SECONDARY_COLOR: "#F4C430",  // Golden Yellow - highlights & CTAs
  ACCENT_COLOR: "#F2F3F7",     // Light Grey - subtle backgrounds

  // Default tax percentage
  TAX_PERCENTAGE: 0,
} as const;
