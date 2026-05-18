import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { AppDefault } from "@/constants/app-resource/default/default";
import {
  AllWorkScheduleRequest,
  CreateWorkScheduleRequest,
  UpdateWorkScheduleParams,
} from "../models/request/work-schedule-request";

export const fetchAllWorkScheduleService = createApiThunk<
  any,
  AllWorkScheduleRequest
>("work-schedule/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/hr/work-schedule/all",
    {
      businessId: AppDefault.BUSINESS_ID,
      ...params,
    },
  );
  return response.data.data;
});

export const fetchWorkScheduleByIdService = createApiThunk<any, string>(
  "work-schedule/fetchById",
  async (workScheduleId) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/hr/work-schedule/${workScheduleId}`,
    );
    return response.data.data;
  },
);

export const createWorkScheduleService = createApiThunk<
  any,
  CreateWorkScheduleRequest
>("work-schedule/create", async (workScheduleData) => {
  const response = await axiosClientWithAuth.post("/api/v1/hr/work-schedule", {
    businessId: AppDefault.BUSINESS_ID,
    ...workScheduleData,
  });
  return response.data.data;
});

export const updateWorkScheduleService = createApiThunk<
  any,
  UpdateWorkScheduleParams
>("work-schedule/update", async ({ id, param }) => {
  const response = await axiosClientWithAuth.put(
    `/api/v1/hr/work-schedule/${id}`,
    param,
  );
  return response.data.data;
});

export const deleteWorkScheduleService = createApiThunk<any, string>(
  "work-schedule/delete",
  async (workScheduleId) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/hr/work-schedule/${workScheduleId}`,
    );
    return response.data.data;
  },
);
