import { createApiThunk } from "@/utils/axios/api-wrapper";
import { bakongApiService } from "../../services/bakong-api-service";
import { BakongConfigModel, BakongAccountModel } from "../../models/bakong-models";

export const fetchMonitoringStatusThunk = createApiThunk(
  "bakong/fetchMonitoringStatus",
  async () => {
    return await bakongApiService.getMonitoringStatus();
  }
);

export const fetchAllConfigsThunk = createApiThunk(
  "bakong/fetchAllConfigs",
  async (params?: { search?: string; pageNo?: number; pageSize?: number }) => {
    return await bakongApiService.getAllConfigs(params);
  }
);

export const createConfigThunk = createApiThunk(
  "bakong/createConfig",
  async (payload: Omit<BakongConfigModel, "id">) => {
    return await bakongApiService.createConfig(payload);
  }
);

export const updateConfigThunk = createApiThunk(
  "bakong/updateConfig",
  async ({ id, payload }: { id: string; payload: Omit<BakongConfigModel, "id"> }) => {
    return await bakongApiService.updateConfig(id, payload);
  }
);

export const deleteConfigThunk = createApiThunk(
  "bakong/deleteConfig",
  async (id: string) => {
    const res = await bakongApiService.deleteConfig(id);
    return res;
  }
);

export const fetchAllAccountsThunk = createApiThunk(
  "bakong/fetchAllAccounts",
  async (params?: { search?: string; pageNo?: number; pageSize?: number }) => {
    return await bakongApiService.getAllAccounts(params);
  }
);

export const createAccountThunk = createApiThunk(
  "bakong/createAccount",
  async (payload: Omit<BakongAccountModel, "id">) => {
    return await bakongApiService.createAccount(payload);
  }
);

export const updateAccountThunk = createApiThunk(
  "bakong/updateAccount",
  async ({ id, payload }: { id: string; payload: Omit<BakongAccountModel, "id"> }) => {
    return await bakongApiService.updateAccount(id, payload);
  }
);

export const deleteAccountThunk = createApiThunk(
  "bakong/deleteAccount",
  async (id: string) => {
    const res = await bakongApiService.deleteAccount(id);
    return res;
  }
);

export const fetchTransactionsThunk = createApiThunk(
  "bakong/fetchTransactions",
  async (params: { search?: string; pageNo?: number; pageSize?: number }) => {
    return await bakongApiService.searchTransactions(params);
  }
);

export const fetchTransactionDetailThunk = createApiThunk(
  "bakong/fetchTransactionDetail",
  async (id: string) => {
    return await bakongApiService.getTransactionDetail(id);
  }
);

export const verifyTransactionThunk = createApiThunk(
  "bakong/verifyTransaction",
  async (payload: { transactionId?: string }) => {
    return await bakongApiService.verifyTransaction(payload);
  }
);
