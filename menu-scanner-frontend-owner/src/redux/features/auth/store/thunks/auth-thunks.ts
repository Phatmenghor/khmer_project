import {
  ChangePasswordRequest,
  LoginCredentialsRequest,
} from "../models/request/auth-request";
import { axiosClient, axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/apiWrapper";
import { storeTokens } from "@/utils/local-storage/token";
import { storeUserInfo } from "@/utils/local-storage/userInfo";

export const loginService = createApiThunk<any, LoginCredentialsRequest>(
  "auth/login",
  async (credentials) => {
    const response = await axiosClient.post("/api/v1/auth/login", credentials);
    const data = response.data.data;

    if (data.accessToken) {
      storeTokens(data.accessToken, data.refreshToken);
      storeUserInfo(data);
    }

    return data;
  }
);

export const getProfileService = createApiThunk<any, void>(
  "auth/getProfile",
  async () => {
    const response = await axiosClientWithAuth.get("/api/v1/users/platform-profile");
    return response.data.data;
  }
);

export const updateProfileService = createApiThunk<any, any>(
  "auth/updateProfile",
  async (profileData) => {
    const response = await axiosClientWithAuth.put(
      "/api/v1/users/platform-profile",
      profileData
    );
    return response.data.data;
  }
);

export const getBusinessProfileService = createApiThunk<any, void>(
  "auth/getBusinessProfile",
  async () => {
    const response = await axiosClientWithAuth.get("/api/v1/users/business-profile");
    return response.data.data;
  }
);

export const updateBusinessProfileService = createApiThunk<any, any>(
  "auth/updateBusinessProfile",
  async (profileData) => {
    const response = await axiosClientWithAuth.put(
      "/api/v1/users/business-profile",
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
