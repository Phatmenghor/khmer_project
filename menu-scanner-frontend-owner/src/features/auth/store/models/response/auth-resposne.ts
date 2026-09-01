/**
 * Auth API Models
 * API request/response models for authentication
 */

export interface UserAuthResponseModel {
  userId: string;
  userIdentifier: string;
  email: string;
  fullName: string;
  profileImageUrl?: string;
  userType: string;
  businessId?: string;
  businessName?: string;
  businessStatus?: string;
  isSubscriptionActive?: string | boolean;
  roles: string[];
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
}
