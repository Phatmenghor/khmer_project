import {
  ChangePasswordRequest,
  LoginCredentialsRequest,
} from "../models/request/auth-request";
import { axiosClient, axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { storeAdminTokens, storeTokens, clearAllTokens } from "@/utils/local-storage/token";
import { storeAdminUserInfo, storeUserInfo } from "@/utils/local-storage/userInfo";

export const loginService = createApiThunk<any, LoginCredentialsRequest>(
  "auth/login",
  async (credentials) => {
    if (!credentials || !credentials.userIdentifier?.trim()) {
      throw new Error("User identifier is required.");
    }
    if (!credentials.password) {
      throw new Error("Password is required.");
    }

    const response = await axiosClient.post("/api/v1/auth/login", credentials);
    const data = response.data.data;

    if (credentials.userType === "BUSINESS_USER" && data.userType && data.userType !== "BUSINESS_USER" && data.userType !== "BUSINESS_OWNER") {
      clearAllTokens();
      throw new Error("Access denied. Public sign-in is strictly for Business accounts.");
    }

    if (credentials.userType === "PLATFORM_USER" && data.userType && data.userType !== "PLATFORM_USER") {
      clearAllTokens();
      throw new Error("Access denied. Only Platform Users can sign in here.");
    }

    if (data?.accessToken) {
      const isAdmin = (userType?: string) =>
        userType === "BUSINESS_USER" ||
        userType === "PLATFORM_USER" ||
        userType === "BUSINESS_OWNER" ||
        userType === "SUPER_ADMIN";

      if (isAdmin(data.userType)) {
        storeAdminTokens(data.accessToken, data.refreshToken);
        storeAdminUserInfo(data);
        storeTokens(data.accessToken, data.refreshToken);
        storeUserInfo(data);
      } else {
        storeTokens(data.accessToken, data.refreshToken);
        storeUserInfo(data);
      }
    }

    return data;
  }
);

export const getProfileService = createApiThunk<any, void>(
  "auth/getProfile",
  async (_, signal) => {
    const response = await axiosClientWithAuth.get("/api/v1/users/profile", { signal });
    return response.data.data;
  }
);

export const updateProfileService = createApiThunk<any, any>(
  "auth/updateProfile",
  async (profileData) => {
    if (!profileData || typeof profileData !== "object") {
      throw new Error("Profile data is required for update.");
    }
    const response = await axiosClientWithAuth.put(
      "/api/v1/users/profile",
      profileData
    );
    return response.data.data;
  }
);

export const getCustomerProfileService = createApiThunk<any, void>(
  "auth/getCustomerProfile",
  async () => {
    const response = await axiosClientWithAuth.get("/api/v1/users/customer-profile");
    return response.data.data;
  }
);

export const getBusinessProfileService = getProfileService;
export const updateBusinessProfileService = updateProfileService;

export const updateCustomerProfileService = createApiThunk<any, any>(
  "auth/updateCustomerProfile",
  async (profileData) => {
    if (!profileData || typeof profileData !== "object") {
      throw new Error("Customer profile data is required for update.");
    }
    const response = await axiosClientWithAuth.put(
      "/api/v1/users/customer-profile",
      profileData
    );
    return response.data.data;
  }
);

export const changePasswordService = createApiThunk<any, ChangePasswordRequest>(
  "auth/changePassword",
  async (passwordData) => {
    if (!passwordData || !passwordData.currentPassword || !passwordData.newPassword) {
      throw new Error("Current password and new password are required.");
    }
    const response = await axiosClientWithAuth.post(
      "/api/v1/users/change-password",
      passwordData
    );
    return response.data.data;
  }
);

export const deleteAccountService = createApiThunk<any, void>(
  "auth/deleteAccount",
  async () => {
    const response = await axiosClientWithAuth.delete("/api/v1/users/profile");
    return response.data.data;
  }
);

export interface CustomerRegisterRequest {
  userIdentifier: string;
  email?: string;
  password: string;
  userType?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  phoneNumber?: string;
  address?: string;
  businessId?: string;
}

export const registerCustomerService = createApiThunk<any, CustomerRegisterRequest>(
  "auth/registerCustomer",
  async (registerData) => {
    if (!registerData || !registerData.userIdentifier?.trim() || !registerData.password) {
      throw new Error("User identifier and password are required for registration.");
    }
    const response = await axiosClient.post("/api/v1/auth/register", {
      ...registerData,
      userType: "CUSTOMER",
      accountStatus: "ACTIVE",
    });
    return response.data.data;
  }
);

export interface QuickRegisterRequest {
  userIdentifier: string;
  password: string;
  userType?: string;
  role?: string;
  roleName?: string;
}

export const registerQuickUserService = createApiThunk<any, QuickRegisterRequest>(
  "auth/registerQuickUser",
  async (registerData) => {
    if (!registerData || !registerData.userIdentifier?.trim() || !registerData.password) {
      throw new Error("Username and password are required for registration.");
    }
    const response = await axiosClient.post("/api/v1/public/register", registerData);
    return response.data.data;
  }
);
