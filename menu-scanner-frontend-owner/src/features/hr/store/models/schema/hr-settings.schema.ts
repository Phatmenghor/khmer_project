import { z } from "zod";

export const dayShiftSchema = z.object({
  dayOfWeek: z.string(),
  enabled: z.boolean(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  breakStartTime: z.string().optional(),
  breakEndTime: z.string().optional(),
  enableCheckIn: z.boolean().optional(),
  scanMode: z.string().optional(),
});

export const hrSettingsSchema = z.object({
  enableLeaveManagement: z.boolean().optional().default(true),
  annualLeaveDaysPerYear: z.string().optional().or(z.literal("")),
  sickLeaveDaysPerYear: z.string().optional().or(z.literal("")),
  specialLeaveDaysPerYear: z.string().optional().or(z.literal("")),
  dayShifts: z.array(dayShiftSchema).optional().default([]),
});

export type HRSettingsFormValues = z.infer<typeof hrSettingsSchema>;
