import { z } from "zod";

export const createLeaveSchema = z.object({
  leaveTypeEnum: z.string().min(1, "Leave type name is required"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
  reason: z.string().min(1, "Reason is required"),
});

export const updateLeaveSchema = z.object({
  leaveTypeEnum: z.string().min(1, "Leave type name is required"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
  reason: z.string().min(1, "Reason is required"),
});

export const approveLeaveSchema = z.object({
  status: z.string().min(1, "Status is required"),
  actionNote: z.string().min(1, "Action Note is required"),
});

export type LeaveFormData = {
  id: string;
  leaveTypeEnum: string;
  startDate: string;
  endDate: string;
  reason: string;
};
