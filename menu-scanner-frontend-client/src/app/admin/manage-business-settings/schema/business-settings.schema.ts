import { z } from "zod";

const imageUrlsSchema = z.object({
  sm: z.string().optional(),
  md: z.string().optional(),
  o: z.string().optional(),
}).optional();

export const businessSettingsSchema = z.object({
  businessName: z.string().optional(),
  taxPercentage: z.string().optional(),
  logoBusiness: imageUrlsSchema,
  enableStock: z.enum(["ENABLED", "DISABLED"]),
  socialMedia: z.array(
    z.object({
      name: z.string().optional(),
      linkUrl: z.string().optional(),
      image: imageUrlsSchema,
    }).refine(
      (item) => {
        // If name is empty, all fields can be empty
        if (!item.name || item.name.trim() === "") {
          return true;
        }
        // If name is selected, linkUrl is required
        return item.linkUrl && item.linkUrl.trim() !== "";
      },
      {
        message: "Profile link is required when platform name is selected",
      }
    )
  ).optional(),

  contactAddress: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional().or(z.literal("")),

  businessHours: z.array(
    z.object({
      day: z.string().optional(),
      openingTime: z.string().optional(),
      closingTime: z.string().optional(),
    }).refine(
      (item) => {
        // If day is empty, all fields can be empty
        if (!item.day || item.day.trim() === "") {
          return true;
        }
        // If day is selected, opening and closing times are required
        return item.openingTime && item.openingTime.trim() !== "" &&
               item.closingTime && item.closingTime.trim() !== "";
      },
      {
        message: "Opening and closing times are required when a day is selected",
      }
    )
  ).optional(),

  useBrands: z.boolean().optional(),
  lowStockThreshold: z.number().int().min(1, "Must be at least 1").optional(),
  telegramGroupChatId: z.string().optional(),
});

export type BusinessSettingsFormData = z.infer<typeof businessSettingsSchema>;
