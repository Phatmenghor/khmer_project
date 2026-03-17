import { DayOfWeek } from "@/types/business-profile";
import { z } from "zod";

export const createWorkScheduleSchema = z.object({
  userId: z.string().uuid("Invalid userId"),
  businessId: z.string().uuid("Invalid businessId"),
  name: z.string().min(1, "Schedule name is required"),
  scheduleTypeEnum: z.string().min(1, "Schedule type is required"),
  workDays: z
    .array(z.enum(DayOfWeek))
    .min(1, "At least one work day is required"),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format HH:mm or HH:mm:ss"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format HH:mm or HH:mm:ss"),
  breakStartTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format HH:mm or HH:mm:ss")
    .optional(),
  breakEndTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format HH:mm or HH:mm:ss")
    .optional(),
});
export const updateWorkScheduleSchema = z.object({
  name: z.string().min(1, "Schedule name is required"),
  scheduleTypeEnum: z.string().min(1, "Schedule type is required"),
  workDays: z
    .array(z.enum(DayOfWeek))
    .min(1, "At least one work day is required"),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format HH:mm or HH:mm:ss"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format HH:mm or HH:mm:ss"),
  breakStartTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format HH:mm or HH:mm:ss")
    .optional(),
  breakEndTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format HH:mm or HH:mm:ss")
    .optional(),
});
export type WorkScheduleFormData = {
  id: string;
  userId: string;
  businessId: string;
  name: string;
  scheduleTypeEnum: string;
  workDays: DayOfWeek[];
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
};
