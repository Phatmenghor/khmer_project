const FALLBACK_BUSINESS_ID = "a31073bb-a919-4a63-bb54-051d15ddc4c9";

function getBusinessId(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("businessId") ?? FALLBACK_BUSINESS_ID;
  }
  return FALLBACK_BUSINESS_ID;
}

export const AppDefault = {
  RESET_PASSWORD: "88889999",

  get BUSINESS_ID(): string {
    return getBusinessId();
  },
  PAGE_SIZE: 15,
  PAGE_SIZE_OPTIONS: [10, 15, 20, 50, 100],
  DEFAULT_PAGE_SIZE: 15,
  DEFAULT_DEBOUNCE_MS: 400,
};

export const SocialAuthConfig = {
  TELEGRAM_BOT_NAME:
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "CambodiaEMenuBot",

  TELEGRAM_BOT_ID: process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID || "8464259107",
};
