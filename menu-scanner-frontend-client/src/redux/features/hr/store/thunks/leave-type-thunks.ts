import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { AppDefault } from "@/constants/app-resource/default/default";
import {
  AllLeaveTypeRequest,
  CreateLeaveTypeRequest,
  UpdateLeaveTypeParams,
} from "../models/request/leave-type-request";

export const fetchAllLeaveTypesService = createApiThunk<
  any,
  AllLeaveTypeRequest
>("leave-type/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/enums/leave-type/all",
    {
      businessId: AppDefault.BUSINESS_ID,
      ...params,
    }
  );
  return response.data.data;
});

export const fetchLeaveTypeByIdService = createApiThunk<any, string>(
  "leave-type/fetchById",
  async (leaveTypeId) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/enums/leave-type/${leaveTypeId}`
    );
    return response.data.data;
  }
);

export const createLeaveTypeService = createApiThunk<
  any,
  CreateLeaveTypeRequest
>("leave-type/create", async (leaveTypeData) => {
  const response = await axiosClientWithAuth.post("/api/v1/enums/leave-type", {
    businessId: AppDefault.BUSINESS_ID,
    ...leaveTypeData,
  });
  return response.data.data;
});

export const updateLeaveTypeService = createApiThunk<
  any,
  UpdateLeaveTypeParams
>("leave-type/update", async ({ id, param }) => {
  const response = await axiosClientWithAuth.put(
    `/api/v1/enums/leave-type/${id}`,
    param
  );
  return response.data.data;
});

export const deleteLeaveTypeService = createApiThunk<any, string>(
  "leave-type/delete",
  async (leaveTypeId) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/enums/leave-type/${leaveTypeId}`
    );
    return response.data.data;
  }
);
