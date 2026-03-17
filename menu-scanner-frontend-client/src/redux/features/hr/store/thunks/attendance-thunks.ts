import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { AppDefault } from "@/constants/app-resource/default/default";
import { AttendanceFilters } from "../models/type/attendance-types";
import {
  CreateAttendanceRequest,
  UpdateAttendanceParams,
} from "../models/request/attendance-request";

export const fetchAllAttendanceService = createApiThunk<any, AttendanceFilters>(
  "attendance/fetchAll",
  async (params) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/hr/attendance/all",
      {
        businessId: AppDefault.BUSINESS_ID,
        ...params,
      },
    );
    return response.data.data;
  },
);

export const fetchAttendanceByIdService = createApiThunk<any, string>(
  "attendance/fetchById",
  async (attendanceId) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/hr/attendance/${attendanceId}`,
    );
    return response.data.data;
  },
);

export const createAttendanceService = createApiThunk<
  any,
  CreateAttendanceRequest
>("attendance/create", async (attendanceData) => {
  const response = await axiosClientWithAuth.post("/api/v1/hr/attendance", {
    businessId: AppDefault.BUSINESS_ID,
    ...attendanceData,
  });
  return response.data.data;
});

export const updateAttendanceService = createApiThunk<
  any,
  UpdateAttendanceParams
>("attendance/update", async ({ id, param }) => {
  const response = await axiosClientWithAuth.put(
    `/api/v1/hr/attendance/${id}`,
    param,
  );
  return response.data.data;
});

export const deleteAttendanceService = createApiThunk<any, string>(
  "attendance/delete",
  async (attendanceId) => {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/hr/attendance/${attendanceId}`,
    );
    return response.data.data;
  },
);
