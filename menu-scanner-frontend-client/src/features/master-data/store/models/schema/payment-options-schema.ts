import { z } from "zod";

/**
 * Create PaymentOption Schema
 */
export const createPaymentOptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  paymentOptionType: z.string().min(1, "Payment option type is required"),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    errorMap: () => ({ message: "Status is required" }),
  }),
});

/**
 * Update PaymentOption Schema
 */
export const updatePaymentOptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  paymentOptionType: z.string().min(1, "Payment option type is required"),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    errorMap: () => ({ message: "Status is required" }),
  }),
});

export type CreatePaymentOptionData = z.infer<
  typeof createPaymentOptionSchema
>;

export type UpdatePaymentOptionData = z.infer<
  typeof updatePaymentOptionSchema
>;
