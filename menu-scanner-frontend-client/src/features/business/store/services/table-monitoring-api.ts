import { axiosClient } from "@/utils/axios";
import { TableMonitoringItem } from "../models/type/table-monitoring-type";

export interface CreateTableRequest {
  number: string;
  zone: string;
  capacity: number;
}

export const tableMonitoringApi = {
  fetchTables: async () => {
    const response = await axiosClient.get<{ data: TableMonitoringItem[] }>("/api/v1/admin/tables");
    return response.data;
  },

  createTable: async (payload: CreateTableRequest) => {
    const response = await axiosClient.post<{ data: TableMonitoringItem }>("/api/v1/admin/tables", payload);
    return response.data;
  },

  updateTableStatus: async (tableId: string, status: string) => {
    const response = await axiosClient.put<{ data: TableMonitoringItem }>(
      `/api/v1/admin/tables/${tableId}/status`,
      { status }
    );
    return response.data;
  },

  payTableOrder: async (tableId: string, paymentMethod: string) => {
    const response = await axiosClient.post<{ data: any }>(
      `/api/v1/admin/tables/${tableId}/pay`,
      { paymentMethod }
    );
    return response.data;
  },
};
