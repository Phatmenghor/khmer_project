
import { ImageUrls } from "../request/users-request";

export interface UserAuthResponseModel {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: string;
  userIdentifier: string;
  email: string;
  fullName: string;
  profileImage?: ImageUrls;
  userType: string;
  roles: string[];
  businessId: string;
  businessName: string;
  businessStatus: string;
  isSubscriptionActive: string;
}
