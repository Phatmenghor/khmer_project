export interface SocialAuthResponse {
  success: boolean;
  message: string;
  provider: string;
  userId: string;
  userIdentifier: string;
  userType: string;
  accessToken: string;
  refreshToken: string;
  socialId: string;
  socialUsername: string;
  syncedAt: string;
  isNewUser: boolean;
}

export interface SocialSyncResponse {
  success: boolean;
  message: string;
  provider: string;
  syncedAt: string | null;
  telegramId: number | null;
  telegramUsername: string | null;
  telegramFirstName: string | null;
  telegramLastName: string | null;
  telegramPhotoUrl: string | null;
  googleId: string | null;
  googleEmail: string | null;
}
