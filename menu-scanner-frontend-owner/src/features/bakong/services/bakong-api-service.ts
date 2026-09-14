import { axiosClientWithAuth } from "@/utils/axios";
import {
  BakongConfigModel,
  BakongAccountModel,
  BakongTransactionModel,
  BakongMonitoringStatusModel,
  BakongVerifyResponseModel,
  BakongTransactionLogModel,
} from "../models/bakong-models";

export interface PageResponseModel<T> {
  content: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const bakongApiService = {
  // --- Status & Monitoring ---
  getMonitoringStatus: async () => {
    const res = await axiosClientWithAuth.get<{ data: BakongMonitoringStatusModel }>("/api/v1/bakong/status");
    return res.data.data;
  },

  // --- Bakong Configurations ---
  getAllConfigs: async (params?: { search?: string; pageNo?: number; pageSize?: number }) => {
    const res = await axiosClientWithAuth.post<{ data: PageResponseModel<BakongConfigModel> }>("/api/v1/bakong-configs/get-all", {
      search: params?.search || "",
      pageNo: params?.pageNo || 1,
      pageSize: params?.pageSize || 15,
    });
    return res.data.data;
  },

  getConfigById: async (id: string) => {
    const res = await axiosClientWithAuth.get<{ data: BakongConfigModel }>(`/api/v1/bakong-configs/${id}`);
    return res.data.data;
  },

  createConfig: async (payload: Omit<BakongConfigModel, "id">) => {
    const res = await axiosClientWithAuth.post<{ data: BakongConfigModel }>("/api/v1/bakong-configs", payload);
    return res.data.data;
  },

  updateConfig: async (id: string, payload: Omit<BakongConfigModel, "id">) => {
    const res = await axiosClientWithAuth.put<{ data: BakongConfigModel }>(`/api/v1/bakong-configs/${id}`, {
      id,
      ...payload,
    });
    return res.data.data;
  },

  deleteConfig: async (id: string) => {
    const res = await axiosClientWithAuth.delete<{ data: BakongConfigModel }>(`/api/v1/bakong-configs/${id}`);
    return res.data.data;
  },

  // --- Bakong Accounts ---
  getAllAccounts: async (params?: { search?: string; pageNo?: number; pageSize?: number }) => {
    const res = await axiosClientWithAuth.post<{ data: PageResponseModel<BakongAccountModel> }>("/api/v1/bakong-accounts/get-all", {
      search: params?.search || "",
      pageNo: params?.pageNo || 1,
      pageSize: params?.pageSize || 15,
    });
    return res.data.data;
  },

  getAccountById: async (id: string) => {
    const res = await axiosClientWithAuth.get<{ data: BakongAccountModel }>(`/api/v1/bakong-accounts/${id}`);
    return res.data.data;
  },

  createAccount: async (payload: Omit<BakongAccountModel, "id">) => {
    const res = await axiosClientWithAuth.post<{ data: BakongAccountModel }>("/api/v1/bakong-accounts", payload);
    return res.data.data;
  },

  updateAccount: async (id: string, payload: Omit<BakongAccountModel, "id">) => {
    const res = await axiosClientWithAuth.put<{ data: BakongAccountModel }>(`/api/v1/bakong-accounts/${id}`, {
      id,
      ...payload,
    });
    return res.data.data;
  },

  deleteAccount: async (id: string) => {
    const res = await axiosClientWithAuth.delete<{ data: BakongAccountModel }>(`/api/v1/bakong-accounts/${id}`);
    return res.data.data;
  },

  // --- Bakong Transactions ---
  searchTransactions: async (params: { search?: string; pageNo?: number; pageSize?: number }) => {
    const res = await axiosClientWithAuth.post<{ data: PageResponseModel<BakongTransactionModel> }>("/api/v1/bakong-transactions/get-all", {
      search: params?.search || "",
      pageNo: params?.pageNo || 1,
      pageSize: params?.pageSize || 15,
    });
    return res.data.data;
  },

  getTransactionDetail: async (id: string) => {
    const res = await axiosClientWithAuth.get<{
      data: {
        transaction: BakongTransactionModel;
        logs: BakongTransactionLogModel[];
      };
    }>(`/api/v1/bakong-transactions/${id}`);
    return res.data.data;
  },

  verifyTransaction: async (payload: { md5?: string; hash?: string }) => {
    const res = await axiosClientWithAuth.post<{ data: BakongVerifyResponseModel }>(
      "/api/v1/bakong-transactions/verify",
      payload
    );
    return res.data.data;
  },
};
