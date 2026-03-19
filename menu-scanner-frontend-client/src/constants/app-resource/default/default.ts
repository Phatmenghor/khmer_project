export const AppDefault = {
  RESET_PASSWORD: "88889999",
  // BUSINESS_ID: "826dc79c-8ec4-4bfe-8d24-f6fd28d18487",
  BUSINESS_ID: "e3b20175-e1af-468f-9feb-18c7f7a5bb9f",
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
