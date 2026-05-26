


import { UserAuthResponseModel } from "../response/auth-resposne";
import { CustomerUserResponseModel } from "../response/users-response";


export interface AuthState {
  isAuthenticated: boolean;
  authReady: boolean;
  user: UserAuthResponseModel | null;
  profile: CustomerUserResponseModel | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  error: string | null;
}
