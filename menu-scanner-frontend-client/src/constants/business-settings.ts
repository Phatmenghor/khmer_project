/**
 * Business Settings Constants
 * Default values used when business settings are null or not provided
 */

export const BUSINESS_SETTINGS_DEFAULTS = {
  // Default business name
  BUSINESS_NAME: "Emenu Scanner",

  // Default brand colors (hex format)
  PRIMARY_COLOR: "#57823D",
  SECONDARY_COLOR: "#404040",
  ACCENT_COLOR: "#2E74D0",

  // Default tax percentage
  TAX_PERCENTAGE: 0,
} as const;
