import { z } from "zod";

/**
 * Zod Validation Schema for Work Schedule Form (Fully backend-driven without hardcoded defaults)
 */
export const workScheduleSchema = z.object({
  name: z.string().trim().min(1, "Schedule name is required"),
  userIds: z.array(z.string()).optional().default([]),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  breakStartTime: z.string().optional(),
  breakEndTime: z.string().optional(),
});

export type WorkScheduleFormValues = z.infer<typeof workScheduleSchema>;

/**
 * Zod Validation Schema for Leave Form
 */
export const leaveSchema = z.object({
  userId: z.string().optional(),
  leaveType: z.string().min(1, "Please select a leave type"),
  otherLeaveType: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().trim().min(1, "Reason for leave is required"),
});

export type LeaveFormValues = z.infer<typeof leaveSchema>;

/**
 * Zod Validation Schema for Attendance Form
 */
export const attendanceSchema = z.object({
  userId: z.string().min(1, "Please select a staff member"),
  checkIn: z.string().min(1, "Check-in time is required"),
  checkOut: z.string().optional(),
  status: z.string().min(1, "Please select attendance status"),
  notes: z.string().optional(),
});

export type AttendanceFormValues = z.infer<typeof attendanceSchema>;
