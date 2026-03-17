import { z } from "zod";

export const createLeaveTypeSchema = z.object({
  enumName: z.string().min(1, "Leave type name is required"),
  description: z.string().optional().or(z.literal("")),
});

export const updateLeaveTypeSchema = z.object({
  enumName: z.string().min(1, "Leave type name is required"),
  description: z.string().optional().or(z.literal("")),
});

export type LeaveTypeFormData = {
  id: string;
  enumName: string;
  description: string;
};
