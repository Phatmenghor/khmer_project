export const AppDefault = {
  RESET_PASSWORD: "88889999",
  // BUSINESS_ID: "826dc79c-8ec4-4bfe-8d24-f6fd28d18487",
  BUSINESS_ID: "4bb5a2f0-e522-4a3a-ab16-3d9c0cbd4a51",
  PAGE_SIZE: 15,
  PAGE_SIZE_OPTIONS: [10, 15, 20, 50, 100],
};

/**
 * Social Auth Configuration
 */
export const SocialAuthConfig = {
  // Telegram Bot username (without @) - used for widget script
  TELEGRAM_BOT_NAME:
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "CambodiaEMenuBot",
  // Telegram Bot numeric ID - used for OAuth popup
  TELEGRAM_BOT_ID: process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID || "8464259107",
};
