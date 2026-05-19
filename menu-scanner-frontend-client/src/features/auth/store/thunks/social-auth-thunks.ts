


import { axiosClient, axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  SocialAuthRequest,
  RefreshTokenRequest,
  TelegramAuthData,
} from "../models/request/social-auth-request";
import {
  SocialAuthResponse,
  SocialSyncResponse,
  RefreshTokenResponse,
} from "../models/response/social-auth-response";


export const socialAuthenticateService = createApiThunk<
  SocialAuthResponse,
  SocialAuthRequest
>("auth/socialAuthenticate", async (request) => {
  const response = await axiosClient.post(
    "/api/v1/auth/social/authenticate",
    request
  );
  return response.data.data;
});


export const telegramAuthenticateService = createApiThunk<
  SocialAuthResponse,
  {
    telegramData: TelegramAuthData;
    userType: string;
    businessId?: string;
  }
>("auth/telegramAuthenticate", async ({ telegramData, userType, businessId }) => {
  const request: SocialAuthRequest = {
    provider: "TELEGRAM",
    accessToken: JSON.stringify(telegramData),
    userType: userType as "CUSTOMER" | "BUSINESS_USER" | "PLATFORM_USER",
    businessId: businessId || null,
  };

  const response = await axiosClient.post(
    "/api/v1/auth/social/authenticate",
    request
  );
  return response.data.data;
});


export const syncSocialAccountService = createApiThunk<
  SocialSyncResponse,
  SocialAuthRequest
>("auth/syncSocialAccount", async (request) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/auth/social/sync",
    request
  );
  return response.data.data;
});


export const getSocialSyncService = createApiThunk<SocialSyncResponse, void>(
  "auth/getSocialSync",
  async () => {
    const response = await axiosClientWithAuth.get("/api/v1/auth/social/sync");
    return response.data.data;
  }
);


export const syncTelegramAccountService = createApiThunk<
  SocialSyncResponse,
  {
    telegramData: TelegramAuthData;
    userType: string;
  }
>("auth/syncTelegramAccount", async ({ telegramData, userType }) => {
  const request: SocialAuthRequest = {
    provider: "TELEGRAM",
    accessToken: JSON.stringify(telegramData),
    userType: userType as "CUSTOMER" | "BUSINESS_USER" | "PLATFORM_USER",
    businessId: null,
  };

  const response = await axiosClientWithAuth.post(
    "/api/v1/auth/social/sync",
    request
  );

  return response.data.data;
});


export const unsyncSocialAccountService = createApiThunk<
  SocialSyncResponse,
  "TELEGRAM" | "GOOGLE"
>("auth/unsyncSocialAccount", async (provider) => {
  const response = await axiosClientWithAuth.delete(
    `/api/v1/auth/social/sync/${provider}`
  );
  return response.data.data;
});


export const refreshTokenService = createApiThunk<
  RefreshTokenResponse,
  RefreshTokenRequest
>("auth/refreshToken", async (request) => {
  const response = await axiosClient.post("/api/v1/auth/refresh", request);
  return response.data.data;
});


export const logoutService = createApiThunk<void, void>(
  "auth/logout",
  async () => {
    try {
      await axiosClientWithAuth.post("/api/v1/users/logout", {});
    } catch (err: unknown) {


    }
  }
);
