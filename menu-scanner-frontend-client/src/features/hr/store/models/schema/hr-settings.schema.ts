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
  annualLeaveDaysPerYear: z.string().min(1, "Annual leave allowance is required").regex(/^\d+$/, "Must be a valid number"),
  sickLeaveDaysPerYear: z.string().min(1, "Sick leave allowance is required").regex(/^\d+$/, "Must be a valid number"),
  specialLeaveDaysPerYear: z.string().min(1, "Special leave allowance is required").regex(/^\d+$/, "Must be a valid number"),
  dayShifts: z.array(dayShiftSchema).optional().default([]),
});

export type HRSettingsFormValues = z.infer<typeof hrSettingsSchema>;
