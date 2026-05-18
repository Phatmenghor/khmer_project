import { z } from "zod";

/**
 * Create Exchange Rate Schema
 */
export const createExchangeRateSchema = z.object({
  usdToKhrRate: z.number().min(0.01, "USD To KHR rate must be greater than 0"),
  usdToCnyRate: z
    .number()
    .min(0.01, "USD To CNY rate must be greater than 0")
    .optional(),
  usdToVndRate: z
    .number()
    .min(0.01, "USD To VND rate must be greater than 0")
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    errorMap: () => ({ message: "Status must be ACTIVE or INACTIVE" }),
  }).optional(),
  notes: z.string().optional(),
});

/**
 * Update Exchange Rate Schema
 */
export const updateExchangeRateSchema = z.object({
  usdToKhrRate: z.number().min(0.01, "USD To KHR rate must be greater than 0"),
  usdToCnyRate: z
    .number()
    .min(0.01, "USD To CNY rate must be greater than 0")
    .optional(),
  usdToVndRate: z
    .number()
    .min(0.01, "USD To VND rate must be greater than 0")
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    errorMap: () => ({ message: "Status must be ACTIVE or INACTIVE" }),
  }).optional(),
  notes: z.string().optional(),
});

export type CreateExchangeRateData = z.infer<typeof createExchangeRateSchema>;
export type UpdateExchangeRateData = z.infer<typeof updateExchangeRateSchema>;
export type ExchangeRateFormData = z.infer<typeof createExchangeRateSchema>;
