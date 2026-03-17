import { z } from "zod";

export const createWorkScheduleTypeSchema = z.object({
  enumName: z.string().min(1, "Work schedule name is required"),
  description: z.string().optional().or(z.literal("")),
});

export const updateWorkScheduleTypeSchema = z.object({
  enumName: z.string().min(1, "Work schedule name is required"),
  description: z.string().optional().or(z.literal("")),
});

export type WorkScheduleTypeFormData = {
  id: string;
  enumName: string;
  description: string;
};
