import { z } from "zod";

export const updateRemarksSchema = z.object({
  remarks: z.string().max(500, "Remarks must not exceed 500 characters"),
});

export type AttendanceFormData = {
  id: string;
  remarks: string;
};
