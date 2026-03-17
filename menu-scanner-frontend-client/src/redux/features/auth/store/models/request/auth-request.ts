export interface LoginCredentialsRequest {
  userIdentifier: string;
  password: string;
  userType: string;
  businessId?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
