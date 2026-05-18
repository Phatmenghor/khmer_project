import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { AppDefault } from "@/constants/app-resource/default/default";
import {
  AllLeaveRequest,
  ApproveLeaveParams,
  ApproveLeaveRequest,
  CreateLeaveRequest,
  UpdateLeaveParams,
} from "../models/request/leave-request";

export const fetchAllLeaveService = createApiThunk<any, AllLeaveRequest>(
  "leave/fetchAll",
  async (params) => {
    const response = await axiosClientWithAuth.post("/api/v1/hr/leave/all", {
      businessId: AppDefault.BUSINESS_ID,
      ...params,
    });
    return response.data.data;
  },
);

export const fetchLeaveByIdService = createApiThunk<any, string>(
  "leave/fetchById",
  async (leaveTypeId) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/hr/leave/${leaveTypeId}`,
    );
    return response.data.data;
  },
);

export const createLeaveService = createApiThunk<any, CreateLeaveRequest>(
  "leave/create",
  async (leaveTypeData) => {
    const response = await axiosClientWithAuth.post("/api/v1/hr/leave", {
      businessId: AppDefault.BUSINESS_ID,
      ...leaveTypeData,
    });
    return response.data.data;
  },
);

export const updateLeaveService = createApiThunk<any, UpdateLeaveParams>(
  "leave/update",
  async ({ id, param }) => {
    const response = await axiosClientWithAuth.put(
      `/api/v1/hr/leave/${id}`,
      param,
    );
    return response.data.data;
  },
);

export const approveLeaveService = createApiThunk<any, ApproveLeaveParams>(
  "leave/approve",
  async ({ id, param }) => {
    const response = await axiosClientWithAuth.post(
      `/api/v1/hr/leave/${id}/approve`,
      param,
    );
    return response.data.data;
  },
);

export const deleteLeaveService = createApiThunk<any, string>(
  "leave/delete",
  async (leaveTypeId) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/hr/leave/${leaveTypeId}`,
    );
    return response.data.data;
  },
);
