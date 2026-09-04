


import { axiosClient, axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { storeAdminTokens, storeTokens, clearToken, clearRefreshToken, clearAdminTokens } from "@/utils/local-storage/token";
import { storeAdminUserInfo, storeUserInfo, clearUserInfo, clearAdminUserInfo } from "@/utils/local-storage/userInfo";
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

const handleSocialTokenStorage = (data: any, requestedUserType?: string) => {
  if (!data?.accessToken) return;
  const isPlatformUser = data.userType === "PLATFORM_USER" || requestedUserType === "PLATFORM_USER";
  if (isPlatformUser) {
    storeAdminTokens(data.accessToken, data.refreshToken);
    storeAdminUserInfo(data);
  } else {
    storeTokens(data.accessToken, data.refreshToken);
    storeUserInfo(data);
  }
};

export const socialAuthenticateService = createApiThunk<
  SocialAuthResponse,
  SocialAuthRequest
>("auth/socialAuthenticate", async (request) => {
  const payload = {
    ...request,
    userType: request.userType || "BUSINESS_USER",
  };
  const response = await axiosClient.post(
    "/api/v1/auth/social/authenticate",
    payload
  );
  const data = response.data.data;
  handleSocialTokenStorage(data, payload.userType);
  return data;
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
    userType: (userType || "BUSINESS_USER") as "BUSINESS_USER" | "PLATFORM_USER",
    businessId: businessId || null,
  };

  const response = await axiosClient.post(
    "/api/v1/auth/social/authenticate",
    request
  );
  const data = response.data.data;
  handleSocialTokenStorage(data, request.userType);
  return data;
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
    userType: userType as "BUSINESS_USER" | "PLATFORM_USER",
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
