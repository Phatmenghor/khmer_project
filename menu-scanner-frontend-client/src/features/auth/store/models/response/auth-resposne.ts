


export interface UserAuthResponseModel {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: string;
  userIdentifier: string;
  email: string;
  fullName: string;
  profileImageUrl: string | null;
  userType: string;
  roles: string[];
  businessId: string;
  businessName: string;
  businessStatus: string;
  isSubscriptionActive: string;
}
