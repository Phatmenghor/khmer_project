import { z } from "zod";


export const createExchangeRateSchema = z.object({
  businessId: z.string().optional(),
  usdToKhrRate: z.coerce.number().min(0.01, "USD To KHR rate must be greater than 0"),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    errorMap: () => ({ message: "Status must be ACTIVE or INACTIVE" }),
  }).optional(),
  notes: z.string().optional(),
});


export const updateExchangeRateSchema = z.object({
  usdToKhrRate: z.coerce.number().min(0.01, "USD To KHR rate must be greater than 0"),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    errorMap: () => ({ message: "Status must be ACTIVE or INACTIVE" }),
  }).optional(),
  notes: z.string().optional(),
});

export type CreateExchangeRateData = z.infer<typeof createExchangeRateSchema>;
export type UpdateExchangeRateData = z.infer<typeof updateExchangeRateSchema>;
export type ExchangeRateFormData = z.infer<typeof createExchangeRateSchema>;
