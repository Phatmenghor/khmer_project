import { axiosClientWithAuth, axiosClient } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { PlatformProfileResponseModel } from "../models/response/platform-profile-response";
import { PlatformProfileRequestModel } from "../models/request/platform-profile-request";

/**
 * Fetch public platform profile (Brand info, support contacts)
 */
export const fetchPublicPlatformProfileService = createApiThunk<
  PlatformProfileResponseModel,
  void
>("platformProfile/fetchPublic", async () => {
  const response = await axiosClient.get("/api/v1/public/platform-profile");
  return response.data.data;
});

/**
 * Fetch admin platform profile
 */
export const fetchAdminPlatformProfileService = createApiThunk<
  PlatformProfileResponseModel,
  void
>("platformProfile/fetchAdmin", async () => {
  const response = await axiosClientWithAuth.get("/api/v1/admin/platform-profile");
  return response.data.data;
});

/**
 * Update platform profile (Admin)
 */
export const updatePlatformProfileService = createApiThunk<
  PlatformProfileResponseModel,
  PlatformProfileRequestModel
>("platformProfile/update", async (data) => {
  const response = await axiosClientWithAuth.put(
    "/api/v1/admin/platform-profile",
    data
  );
  return response.data.data;
});
