import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import { PaginationResponseModel } from "@/features/master-data/store/models/response/pagination-response";
import { AppDefault } from "@/constants/app-resource/default/default";
import {
  AttendanceModel,
  AttendanceFilterPayload,
  LeaveModel,
  LeaveFilterPayload,
  LeaveBalanceModel,
  WorkScheduleModel,
  WorkScheduleFilterPayload,
  DayShiftDto,
} from "../models/hr-models";

// ── ATTENDANCE THUNKS ──
export const fetchAttendanceListService = createApiThunk<
  PaginationResponseModel<AttendanceModel>,
  AttendanceFilterPayload
>("hr/fetchAttendanceList", async (filter) => {
  const { searchQuery, search, ...rest } = filter || {};
  const response = await axiosClientWithAuth.post("/api/v1/hr/attendance/all", {
    pageNo: 1,
    pageSize: 50,
    sortBy: "createdAt",
    sortDirection: "DESC",
    search: search || searchQuery,
    ...rest,
  });
  return response.data?.data || response.data;
});

export const checkInAttendanceService = createApiThunk<
  AttendanceModel,
  {
    checkInType: "CHECK_IN" | "CHECK_OUT";
    userId?: string;
    latitude?: number;
    longitude?: number;
    remarks?: string;
    workScheduleId?: string;
  }
>("hr/checkInAttendance", async (payload) => {
  const response = await axiosClientWithAuth.post("/api/v1/hr/attendance/check-in", payload);
  return response.data?.data || response.data;
});

export const updateAttendanceService = createApiThunk<
  AttendanceModel,
  { id: string; status: string; remarks?: string }
>("hr/updateAttendance", async ({ id, ...payload }) => {
  const response = await axiosClientWithAuth.put(`/api/v1/hr/attendance/${id}`, payload);
  return response.data?.data || response.data;
});

export const deleteAttendanceService = createApiThunk<AttendanceModel, string>(
  "hr/deleteAttendance",
  async (id) => {
    const response = await axiosClientWithAuth.delete(`/api/v1/hr/attendance/${id}`);
    return response.data?.data || response.data;
  }
);

// ── LEAVE THUNKS ──
export const fetchLeaveListService = createApiThunk<
  PaginationResponseModel<LeaveModel>,
  LeaveFilterPayload
>("hr/fetchLeaveList", async (filter) => {
  const { searchQuery, search, status, statuses, ...rest } = filter || {};
  // Normalise: if caller passes single status, convert to array for backend
  const statusesPayload = statuses ?? (status ? [status] : undefined);
  const response = await axiosClientWithAuth.post("/api/v1/hr/leave/all", {
    pageNo: filter?.pageNo ?? 1,
    pageSize: filter?.pageSize ?? 50,
    sortBy: filter?.sortBy ?? "createdAt",
    sortDirection: filter?.sortDirection ?? "DESC",
    search: search || searchQuery,
    statuses: statusesPayload,
    ...rest,
  });
  return response.data?.data || response.data;
});

export const getLeaveByIdService = createApiThunk<LeaveModel, string>(
  "hr/getLeaveById",
  async (id) => {
    const response = await axiosClientWithAuth.get(`/api/v1/hr/leave/${id}`);
    return response.data?.data || response.data;
  }
);

export const createLeaveService = createApiThunk<
  LeaveModel,
  {
    leaveTypeEnum: string;
    startDate: string;
    endDate: string;
    reason: string;
  }
>("hr/createLeave", async (payload) => {
  const response = await axiosClientWithAuth.post("/api/v1/hr/leave", payload);
  return response.data?.data || response.data;
});

export const updateLeaveService = createApiThunk<
  LeaveModel,
  { id: string; startDate?: string; endDate?: string; reason?: string }
>("hr/updateLeave", async ({ id, ...payload }) => {
  const response = await axiosClientWithAuth.put(`/api/v1/hr/leave/${id}`, payload);
  return response.data?.data || response.data;
});

export const approveLeaveService = createApiThunk<
  LeaveModel,
  { id: string; status: "APPROVED" | "REJECTED" | "CANCELLED"; actionNote?: string }
>("hr/approveLeave", async ({ id, ...payload }) => {
  const response = await axiosClientWithAuth.post(`/api/v1/hr/leave/${id}/approve`, payload);
  return response.data?.data || response.data;
});

export const deleteLeaveService = createApiThunk<LeaveModel, string>(
  "hr/deleteLeave",
  async (id) => {
    const response = await axiosClientWithAuth.delete(`/api/v1/hr/leave/${id}`);
    return response.data?.data || response.data;
  }
);

export const fetchMyLeaveBalanceService = createApiThunk<
  LeaveBalanceModel,
  void
>("hr/fetchMyLeaveBalance", async () => {
  const response = await axiosClientWithAuth.get("/api/v1/hr/leave/balance");
  return response.data?.data || response.data;
});

// ── WORK SCHEDULE THUNKS ──
export const fetchWorkScheduleListService = createApiThunk<
  PaginationResponseModel<WorkScheduleModel>,
  WorkScheduleFilterPayload
>("hr/fetchWorkScheduleList", async (filter) => {
  const { searchQuery, search, ...rest } = filter || {};
  const response = await axiosClientWithAuth.post("/api/v1/hr/work-schedule/all", {
    pageNo: 1,
    pageSize: 50,
    sortBy: "createdAt",
    sortDirection: "DESC",
    search: search || searchQuery,
    ...rest,
  });
  return response.data?.data || response.data;
});

export const fetchWorkScheduleByIdService = createApiThunk<WorkScheduleModel, string>(
  "hr/fetchWorkScheduleById",
  async (id) => {
    const response = await axiosClientWithAuth.get(`/api/v1/hr/work-schedule/${id}`);
    return response.data?.data || response.data;
  }
);

export const createWorkScheduleService = createApiThunk<
  WorkScheduleModel,
  {
    name: string;
    dayShifts: DayShiftDto[];
    userId?: string;
    businessId?: string;
  }
>("hr/createWorkSchedule", async (payload) => {
  const response = await axiosClientWithAuth.post("/api/v1/hr/work-schedule", {
    businessId: AppDefault.BUSINESS_ID,
    ...payload,
  });
  return response.data?.data || response.data;
});

export const updateWorkScheduleService = createApiThunk<
  WorkScheduleModel,
  {
    id: string;
    name?: string;
    dayShifts?: DayShiftDto[];
  }
>("hr/updateWorkSchedule", async ({ id, ...payload }) => {
  const response = await axiosClientWithAuth.put(`/api/v1/hr/work-schedule/${id}`, payload);
  return response.data?.data || response.data;
});

export const deleteWorkScheduleService = createApiThunk<WorkScheduleModel, string>(
  "hr/deleteWorkSchedule",
  async (id) => {
    const response = await axiosClientWithAuth.delete(`/api/v1/hr/work-schedule/${id}`);
    return response.data?.data || response.data;
  }
);
