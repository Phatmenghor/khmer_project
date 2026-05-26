export interface LoginCredentialsRequest {
  userIdentifier: string;
  password: string;
  userType?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
