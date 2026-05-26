import { axiosClient } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/apiWrapper";
import { TelegramAuthData, SocialAuthRequest } from "../models/request/social-auth-request";
import { SocialAuthResponse } from "../models/response/social-auth-response";

export const telegramAuthenticateService = createApiThunk<
  SocialAuthResponse,
  { telegramData: TelegramAuthData; userType: string }
>("auth/telegramAuthenticate", async ({ telegramData, userType }) => {
  const request: SocialAuthRequest = {
    provider: "TELEGRAM",
    accessToken: JSON.stringify(telegramData),
    userType: userType as "CUSTOMER" | "BUSINESS_USER" | "PLATFORM_USER",
    businessId: null,
  };

  const response = await axiosClient.post(
    "/api/v1/auth/social/authenticate",
    request
  );
  return response.data.data;
});
