import { axiosClientWithAuth, axiosClient } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { PlatformBankResponseModel } from "../models/response/platform-bank-response";
import {
  AllPlatformBankRequestModel,
  PlatformBankRequestModel,
} from "../models/request/platform-bank-request";

/**
 * Fetch all platform banks (admin paginated)
 */
export const fetchAllPlatformBanksService = createApiThunk<
  any,
  AllPlatformBankRequestModel
>("platform-banks/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/admin/platform-banks/all",
    params
  );
  return response.data.data;
});

/**
 * Fetch platform bank by ID
 */
export const fetchPlatformBankByIdService = createApiThunk<any, string>(
  "platform-banks/fetchById",
  async (id) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/admin/platform-banks/${id}`
    );
    return response.data.data;
  }
);

/**
 * Create platform bank
 */
export const createPlatformBankService = createApiThunk<
  any,
  PlatformBankRequestModel
>("platform-banks/create", async (data) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/admin/platform-banks",
    data
  );
  return response.data.data;
});

/**
 * Update platform bank
 */
export const updatePlatformBankService = createApiThunk<
  any,
  { id: string; data: PlatformBankRequestModel }
>("platform-banks/update", async ({ id, data }) => {
  const response = await axiosClientWithAuth.put(
    `/api/v1/admin/platform-banks/${id}`,
    data
  );
  return response.data.data;
});

/**
 * Delete platform bank
 */
export const deletePlatformBankService = createApiThunk<any, string>(
  "platform-banks/delete",
  async (id) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/admin/platform-banks/${id}`
    );
    return response.data.data;
  }
);

/**
 * Fetch active platform bank accounts (Public API for checkout/modals)
 */
export const fetchPublicActivePlatformBanksService = createApiThunk<
  PlatformBankResponseModel[],
  void
>("platform-banks/fetchPublic", async () => {
  const response = await axiosClient.get(
    "/api/v1/public/platform-banks"
  );
  return response.data.data;
});
