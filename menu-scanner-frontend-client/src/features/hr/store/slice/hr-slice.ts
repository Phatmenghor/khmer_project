import { createSlice } from "@reduxjs/toolkit";
import {
  AttendanceModel,
  LeaveModel,
  WorkScheduleModel,
} from "../models/hr-models";
import {
  fetchAttendanceListService,
  fetchLeaveListService,
  fetchWorkScheduleListService,
} from "../thunks/hr-thunks";

interface HRState {
  attendanceList: AttendanceModel[];
  attendanceTotalItems: number;
  attendanceLoading: boolean;

  leaveList: LeaveModel[];
  leaveTotalItems: number;
  leaveLoading: boolean;

  workScheduleList: WorkScheduleModel[];
  workScheduleTotalItems: number;
  workScheduleLoading: boolean;

  error: string | null;
}

const initialState: HRState = {
  attendanceList: [],
  attendanceTotalItems: 0,
  attendanceLoading: false,

  leaveList: [],
  leaveTotalItems: 0,
  leaveLoading: false,

  workScheduleList: [],
  workScheduleTotalItems: 0,
  workScheduleLoading: false,

  error: null,
};

export const hrSlice = createSlice({
  name: "hr",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Attendance
    builder.addCase(fetchAttendanceListService.pending, (state) => {
      state.attendanceLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAttendanceListService.fulfilled, (state, action) => {
      state.attendanceLoading = false;
      const res = (action.payload as any)?.data || action.payload;
      state.attendanceList = res?.content || res?.items || [];
      state.attendanceTotalItems = res?.totalElements || 0;
    });
    builder.addCase(fetchAttendanceListService.rejected, (state, action) => {
      state.attendanceLoading = false;
      state.error = action.error?.message || "Failed to fetch attendance records";
    });

    // Leaves
    builder.addCase(fetchLeaveListService.pending, (state) => {
      state.leaveLoading = true;
      state.error = null;
    });
    builder.addCase(fetchLeaveListService.fulfilled, (state, action) => {
      state.leaveLoading = false;
      const res = (action.payload as any)?.data || action.payload;
      state.leaveList = res?.content || res?.items || [];
      state.leaveTotalItems = res?.totalElements || 0;
    });
    builder.addCase(fetchLeaveListService.rejected, (state, action) => {
      state.leaveLoading = false;
      state.error = action.error?.message || "Failed to fetch leave requests";
    });

    // Work Schedules
    builder.addCase(fetchWorkScheduleListService.pending, (state) => {
      state.workScheduleLoading = true;
      state.error = null;
    });
    builder.addCase(fetchWorkScheduleListService.fulfilled, (state, action) => {
      state.workScheduleLoading = false;
      const res = (action.payload as any)?.data || action.payload;
      state.workScheduleList = res?.content || res?.items || [];
      state.workScheduleTotalItems = res?.totalElements || 0;
    });
    builder.addCase(fetchWorkScheduleListService.rejected, (state, action) => {
      state.workScheduleLoading = false;
      state.error = action.error?.message || "Failed to fetch work schedules";
    });
  },
});

export const hrReducer = hrSlice.reducer;
