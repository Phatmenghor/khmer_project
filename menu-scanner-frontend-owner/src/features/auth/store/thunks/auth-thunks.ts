


import {
  ChangePasswordRequest,
  LoginCredentialsRequest,
} from "../models/request/auth-request";
import { axiosClient, axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { storeAdminTokens, storeTokens } from "@/utils/local-storage/token";
import { storeAdminUserInfo, storeUserInfo } from "@/utils/local-storage/userInfo";


export const loginService = createApiThunk<any, LoginCredentialsRequest>(
  "auth/login",
  async (credentials) => {
    const response = await axiosClient.post("/api/v1/auth/login", credentials);
    const data = response.data.data;


    if (data.accessToken) {
      const isAdmin = (userType?: string) => userType === "BUSINESS_USER";

      if (isAdmin(data.userType)) {
        storeAdminTokens(data.accessToken, data.refreshToken);
        storeAdminUserInfo(data);
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
    const response = await axiosClient.post("/api/v1/auth/register", {
      ...registerData,
      userType: "CUSTOMER",
      accountStatus: "ACTIVE",
    });
    return response.data.data;
  }
);
