import { z } from "zod";

const imageUrlsSchema = z.object({
  sm: z.string().optional(),
  md: z.string().optional(),
  o: z.string().optional(),
});

export const createPaymentOptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  paymentOptionType: z.string().min(1, "Type is required"),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    errorMap: () => ({ message: "Status is required" }),
  }),
  image: imageUrlsSchema.optional(),
});

export const updatePaymentOptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  paymentOptionType: z.string().min(1, "Type is required"),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    errorMap: () => ({ message: "Status is required" }),
  }),
  image: imageUrlsSchema.optional(),
});

export type CreatePaymentOptionData = z.infer<
  typeof createPaymentOptionSchema
>;

export type UpdatePaymentOptionData = z.infer<
  typeof updatePaymentOptionSchema
>;
