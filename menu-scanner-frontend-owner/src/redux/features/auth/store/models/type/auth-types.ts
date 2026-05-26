import { UserAuthResponseModel } from "../response/auth-resposne";
import { UserResponseModel } from "../response/users-response";

export interface AuthState {
  isAuthenticated: boolean;
  authReady: boolean;
  user: UserAuthResponseModel | null;
  profile: UserResponseModel | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  error: string | null;
}
