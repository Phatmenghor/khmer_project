import { axiosClientWithAuth } from "@/utils/axios";
import { TableMonitoringItem, TableMonitoringStatus, OrderPaymentStatus } from "../models/type/table-monitoring-type";

export interface CreateTableRequest {
  number: string;
  zone: string;
  capacity: number;
}

export const tableMonitoringApi = {
  fetchTables: async (filterParams?: { status?: string; pageNo?: number; pageSize?: number }) => {
    const response = await axiosClientWithAuth.post<{
      data: any[];
    }>("/api/v1/admin/tables/my-business/all", {
      status: filterParams?.status && filterParams.status !== "ALL" ? filterParams.status : undefined,
    });

    const rawList = Array.isArray(response.data?.data) ? response.data.data : [];

    const mappedTables: TableMonitoringItem[] = rawList.map((t: any, idx: number) => {
      const cleanNum = t.number
        ? (t.number.startsWith("Table ") ? t.number.replace("Table ", "") : t.number)
        : String(idx + 1);

      return {
        id: t.id,
        number: cleanNum,
        zone: t.zone || "Main Hall",
        capacity: t.capacity || 4,
        status: (t.status || "AVAILABLE") as TableMonitoringStatus,
        activeOrder: t.activeOrder ? {
          orderId: t.activeOrder.orderId || t.activeOrderId || t.id,
          orderNumber: t.activeOrder.orderNumber ? t.activeOrder.orderNumber.replace(/^(SESS-?|Session\s*)/i, "") : `ORD-${cleanNum}`,
          totalAmount: t.activeOrder.totalAmount || 0,
          paymentStatus: (t.activeOrder.paymentStatus || "UNPAID") as OrderPaymentStatus,
          itemsSummary: t.activeOrder.itemsSummary || "Active Dining Order",
          createdAt: t.activeOrder.createdAt || t.createdAt || new Date().toISOString(),
        } : (t.activeOrderId ? {
          orderId: t.activeOrderId,
          orderNumber: `ORD-${cleanNum}`,
          totalAmount: 0,
          paymentStatus: "UNPAID",
          itemsSummary: "Active Dining Order",
          createdAt: t.createdAt || new Date().toISOString(),
        } : null),
        seatedMinutes: t.seatedMinutes ? Number(t.seatedMinutes) : undefined,
        seatedAt: t.activeOrder?.createdAt || t.createdAt || t.seatedAt,
      };
    });

    return { data: mappedTables };
  },

  createTable: async (payload: CreateTableRequest) => {
    const response = await axiosClientWithAuth.post<{ data: TableMonitoringItem }>("/api/v1/admin/tables", payload);
    return response.data;
  },

  updateTableStatus: async (tableId: string, status: string) => {
    const response = await axiosClientWithAuth.put<{ data: TableMonitoringItem }>(
      `/api/v1/admin/tables/${tableId}/status`,
      { status }
    );
    return response.data;
  },

  resetTable: async (tableId: string) => {
    const response = await axiosClientWithAuth.post<{ data: TableMonitoringItem }>(
      `/api/v1/admin/tables/${tableId}/reset`
    );
    return response.data;
  },

  deleteTable: async (tableId: string) => {
    const response = await axiosClientWithAuth.delete<{ data: void }>(
      `/api/v1/admin/tables/${tableId}`
    );
    return response.data;
  },

  payTableOrder: async (tableId: string, paymentMethod: string) => {
    const response = await axiosClientWithAuth.post<{ data: any }>(
      "/api/v1/table-sessions/settle",
      { tableId, paymentMethod }
    );
    return response.data;
  },
};
