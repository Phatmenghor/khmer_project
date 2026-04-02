import { z } from "zod";

/**
 * Business Settings Form Schema
 * Type-safe validation and types for business settings form
 */

export const businessSettingsSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  taxPercentage: z.string().optional(),
  logoBusinessUrl: z.string(),
  enableStock: z.enum(["ENABLED", "DISABLED"]),
  socialMedia: z.array(
    z.object({
      name: z.string(),
      imageUrl: z.string(),
      linkUrl: z.string(),
    })
  ),
  primaryColor: z.string().min(1, "Primary color is required"),
  secondaryColor: z.string().min(1, "Secondary color is required"),
  accentColor: z.string().min(1, "Accent color is required"),
});

export type BusinessSettingsFormData = z.infer<typeof businessSettingsSchema>;
