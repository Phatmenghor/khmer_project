export const AppDefault = {
  RESET_PASSWORD: "88889999",
  PAGE_SIZE: 15,
  PAGE_SIZE_OPTIONS: [10, 15, 20, 50, 100],
};

export const SubscriptionConfig = {
  EXPIRY_CRITICAL_DAYS: 7,   // red — change here to update all tables/modals
  EXPIRY_WARNING_DAYS: 30,   // yellow
};

export const SocialAuthConfig = {
  TELEGRAM_BOT_NAME:
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "CambodiaEMenuBot",
  TELEGRAM_BOT_ID: process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID || "8464259107",
};
