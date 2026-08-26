import { createSlice } from "@reduxjs/toolkit";
import {
  AttendanceModel,
  LeaveModel,
  WorkScheduleModel,
} from "../models/hr-models";
import {
  fetchAttendanceListService,
  fetchTodayAttendanceService,
  getAttendanceByIdService,
  fetchLeaveListService,
  getLeaveByIdService,
  approveLeaveService,
  deleteLeaveService,
  fetchMyLeaveBalanceService,
  fetchWorkScheduleListService,
} from "../thunks/hr-thunks";
import { LeaveBalanceModel } from "../models/hr-models";

interface HRState {
  attendanceList: AttendanceModel[];
  todayAttendanceList: AttendanceModel[];
  attendanceTotalItems: number;
  attendanceLoading: boolean;
  selectedAttendance: AttendanceModel | null;
  selectedAttendanceLoading: boolean;

  leaveList: LeaveModel[];
  leaveTotalItems: number;
  leaveLoading: boolean;
  selectedLeave: LeaveModel | null;
  selectedLeaveLoading: boolean;
  myLeaveBalance: LeaveBalanceModel | null;

  workScheduleList: WorkScheduleModel[];
  workScheduleTotalItems: number;
  workScheduleLoading: boolean;

  error: string | null;
}

const initialState: HRState = {
  attendanceList: [],
  todayAttendanceList: [],
  attendanceTotalItems: 0,
  attendanceLoading: false,
  selectedAttendance: null,
  selectedAttendanceLoading: false,

  leaveList: [],
  leaveTotalItems: 0,
  leaveLoading: false,
  selectedLeave: null,
  selectedLeaveLoading: false,
  myLeaveBalance: null,

  workScheduleList: [],
  workScheduleTotalItems: 0,
  workScheduleLoading: false,

  error: null,
};

export const hrSlice = createSlice({
  name: "hr",
  initialState,
  reducers: {
    clearSelectedLeave(state) {
      state.selectedLeave = null;
    },
    clearSelectedAttendance(state) {
      state.selectedAttendance = null;
    },
  },
  extraReducers: (builder) => {
    // ── Attendance ──
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

    builder.addCase(fetchTodayAttendanceService.fulfilled, (state, action) => {
      state.todayAttendanceList = action.payload || [];
    });

    builder.addCase(getAttendanceByIdService.pending, (state) => {
      state.selectedAttendanceLoading = true;
    });
    builder.addCase(getAttendanceByIdService.fulfilled, (state, action) => {
      state.selectedAttendanceLoading = false;
      state.selectedAttendance = (action.payload as any)?.data || action.payload;
    });
    builder.addCase(getAttendanceByIdService.rejected, (state) => {
      state.selectedAttendanceLoading = false;
    });

    // ── Leave list ──
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

    // ── Leave detail (getById — loads statusHistory) ──
    builder.addCase(getLeaveByIdService.pending, (state) => {
      state.selectedLeaveLoading = true;
    });
    builder.addCase(getLeaveByIdService.fulfilled, (state, action) => {
      state.selectedLeaveLoading = false;
      state.selectedLeave = action.payload as LeaveModel;
      // Also update the matching entry in the list so status is in sync
      const updated = action.payload as LeaveModel;
      const idx = state.leaveList.findIndex((l) => l.id === updated.id);
      if (idx !== -1) state.leaveList[idx] = { ...state.leaveList[idx], ...updated };
    });
    builder.addCase(getLeaveByIdService.rejected, (state) => {
      state.selectedLeaveLoading = false;
    });

    // ── Approve / Reject — optimistic local update ──
    builder.addCase(approveLeaveService.fulfilled, (state, action) => {
      const updated = action.payload as LeaveModel;
      const idx = state.leaveList.findIndex((l) => l.id === updated.id);
      if (idx !== -1) state.leaveList[idx] = { ...state.leaveList[idx], ...updated };
      if (state.selectedLeave?.id === updated.id) state.selectedLeave = updated;
    });

    // ── My Leave Balance ──
    builder.addCase(fetchMyLeaveBalanceService.fulfilled, (state, action) => {
      state.myLeaveBalance = action.payload as LeaveBalanceModel;
    });

    // ── Delete — remove from local list ──
    builder.addCase(deleteLeaveService.fulfilled, (state, action) => {
      const deleted = action.payload as LeaveModel;
      state.leaveList = state.leaveList.filter((l) => l.id !== deleted.id);
      state.leaveTotalItems = Math.max(0, state.leaveTotalItems - 1);
      if (state.selectedLeave?.id === deleted.id) state.selectedLeave = null;
    });

    // ── Work Schedules ──
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

export const { clearSelectedLeave, clearSelectedAttendance } = hrSlice.actions;
export const hrReducer = hrSlice.reducer;
