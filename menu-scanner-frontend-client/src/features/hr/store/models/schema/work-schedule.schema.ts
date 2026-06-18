import { DayOfWeek } from "@/types/business-profile";
import { z } from "zod";

const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/;

const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

const baseWorkScheduleFields = {
  name: z.string().min(1, "Schedule name is required"),
  scheduleTypeEnum: z.string().min(1, "Schedule type is required"),
  workDays: z
    .array(z.nativeEnum(DayOfWeek))
    .min(1, "At least one work day is required"),
  startTime: z.string().regex(timeRegex, "Invalid time format HH:mm or HH:mm:ss"),
  endTime: z.string().regex(timeRegex, "Invalid time format HH:mm or HH:mm:ss"),
  breakStartTime: z
    .string()
    .regex(timeRegex, "Invalid time format HH:mm or HH:mm:ss")
    .optional()
    .or(z.literal("")),
  breakEndTime: z
    .string()
    .regex(timeRegex, "Invalid time format HH:mm or HH:mm:ss")
    .optional()
    .or(z.literal("")),
};

const refineTimes = (
  data: {
    startTime: string;
    endTime: string;
    breakStartTime?: string;
    breakEndTime?: string;
  },
  ctx: z.RefinementCtx
) => {
  const startMin = timeToMinutes(data.startTime);
  const endMin = timeToMinutes(data.endTime);

  if (endMin <= startMin) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End time must be after start time",
      path: ["endTime"],
    });
  }

  const hasBreakStart = !!data.breakStartTime && data.breakStartTime !== "";
  const hasBreakEnd = !!data.breakEndTime && data.breakEndTime !== "";

  if (hasBreakStart && !hasBreakEnd) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Break end time is required if break start time is provided",
      path: ["breakEndTime"],
    });
  } else if (!hasBreakStart && hasBreakEnd) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Break start time is required if break end time is provided",
      path: ["breakStartTime"],
    });
  } else if (hasBreakStart && hasBreakEnd) {
    const breakStartMin = timeToMinutes(data.breakStartTime!);
    const breakEndMin = timeToMinutes(data.breakEndTime!);

    if (breakEndMin <= breakStartMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Break end time must be after break start time",
        path: ["breakEndTime"],
      });
    }

    if (breakStartMin < startMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Break start time cannot be before work start time",
        path: ["breakStartTime"],
      });
    }

    if (breakEndMin > endMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Break end time cannot be after work end time",
        path: ["breakEndTime"],
      });
    }
  }
};

export const createWorkScheduleSchema = z
  .object({
    userId: z.string().uuid("Invalid userId"),
    businessId: z.string().uuid("Invalid businessId"),
    ...baseWorkScheduleFields,
  })
  .superRefine(refineTimes);

export const updateWorkScheduleSchema = z
  .object(baseWorkScheduleFields)
  .superRefine(refineTimes);
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
