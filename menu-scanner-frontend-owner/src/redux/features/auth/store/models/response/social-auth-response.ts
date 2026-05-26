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
