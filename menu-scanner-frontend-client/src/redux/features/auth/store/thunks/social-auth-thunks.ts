/**
 * Social Auth Feature - Async Thunks
 * Redux thunks for Telegram/Google social authentication
 */

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

/**
 * Social authenticate thunk
 * For login/registration with Telegram or Google
 */
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

/**
 * Telegram authenticate helper
 * Converts Telegram widget data to API request
 */
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

/**
 * Sync social account thunk
 * Link existing account to Telegram/Google
 */
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

/**
 * Get current social sync status thunk
 * Fetches connected social accounts for the current user
 */
export const getSocialSyncService = createApiThunk<SocialSyncResponse, void>(
  "auth/getSocialSync",
  async () => {
    const response = await axiosClientWithAuth.get("/api/v1/auth/social/sync");
    return response.data.data;
  }
);

/**
 * Telegram sync helper
 * Converts Telegram widget data to sync request
 */
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

/**
 * Unsync social account thunk
 * Disconnect Telegram/Google from account
 */
export const unsyncSocialAccountService = createApiThunk<
  SocialSyncResponse,
  "TELEGRAM" | "GOOGLE"
>("auth/unsyncSocialAccount", async (provider) => {
  const response = await axiosClientWithAuth.delete(
    `/api/v1/auth/social/sync/${provider}`
  );
  return response.data.data;
});

/**
 * Refresh token thunk
 * Get new access token using refresh token
 */
export const refreshTokenService = createApiThunk<
  RefreshTokenResponse,
  RefreshTokenRequest
>("auth/refreshToken", async (request) => {
  const response = await axiosClient.post("/api/v1/auth/refresh", request);
  return response.data.data;
});

/**
 * Logout thunk
 * Invalidate current session on server
 */
export const logoutService = createApiThunk<void, void>(
  "auth/logout",
  async () => {
    console.log("## [LOGOUT] Starting logout...");
    try {
      await axiosClientWithAuth.post("/api/v1/users/logout", {});
      console.log("## [LOGOUT] ✓ Logout successful");
    } catch (err: any) {
      console.error("## [LOGOUT] ❌ Error:", err?.response?.status, err?.message);
      throw err;
    }
  }
);

