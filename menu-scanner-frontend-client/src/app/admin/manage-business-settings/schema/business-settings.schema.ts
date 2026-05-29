import { z } from "zod";


export const businessSettingsSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  taxPercentage: z.string().optional(),
  logoBusinessUrl: z.string(),
  enableStock: z.enum(["ENABLED", "DISABLED"]),
  socialMedia: z.array(
    z.object({
      name: z.string().optional(),
      linkUrl: z.string().optional(),
      imageUrl: z.string().optional(),
    })
  ).optional(),
  primaryColor: z.string().min(1, "Primary color is required"),

  contactAddress: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),

  businessHours: z.array(
    z.object({
      day: z.string().optional(),
      openingTime: z.string().optional(),
      closingTime: z.string().optional(),
    })
  ).optional(),

  useBrands: z.boolean().optional(),
  lowStockThreshold: z.number().int().min(1, "Must be at least 1").optional(),
  telegramGroupChatId: z.string().optional(),
});

export type BusinessSettingsFormData = z.infer<typeof businessSettingsSchema>;
