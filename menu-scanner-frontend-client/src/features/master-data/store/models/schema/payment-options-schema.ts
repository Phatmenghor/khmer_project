import { z } from "zod";

export const createPaymentOptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  paymentOptionType: z.string().min(1, "Type is required"),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    errorMap: () => ({ message: "Status is required" }),
  }),
  imageUrl: z.string().optional().default(""),
});

export const updatePaymentOptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  paymentOptionType: z.string().min(1, "Type is required"),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    errorMap: () => ({ message: "Status is required" }),
  }),
  imageUrl: z.string().optional().default(""),
});

export type CreatePaymentOptionData = z.infer<
  typeof createPaymentOptionSchema
>;

export type UpdatePaymentOptionData = z.infer<
  typeof updatePaymentOptionSchema
>;
