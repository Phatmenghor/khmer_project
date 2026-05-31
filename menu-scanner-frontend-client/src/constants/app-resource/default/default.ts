export const AppDefault = {
  RESET_PASSWORD: "88889999",

  BUSINESS_ID: "78e375fa-386d-4de2-a485-ee7a9a6c4bdf",
  PAGE_SIZE: 15,
  PAGE_SIZE_OPTIONS: [10, 15, 20, 50, 100],
};

export const SocialAuthConfig = {
  TELEGRAM_BOT_NAME:
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "CambodiaEMenuBot",

  TELEGRAM_BOT_ID: process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID || "8464259107",
};
