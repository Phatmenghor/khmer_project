export type SocialProvider = "TELEGRAM" | "GOOGLE";
export type UserType = "CUSTOMER" | "BUSINESS_USER" | "PLATFORM_USER";

export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface SocialAuthRequest {
  provider: SocialProvider;
  accessToken: string;
  userType: UserType;
  businessId?: string | null;
  deviceInfo?: string | null;
  ipAddress?: string | null;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
