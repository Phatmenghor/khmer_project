import { z } from "zod";

/**
 * Bulk Promotion Schema with validation
 */
export const bulkPromotionSchema = z
  .object({
    productIds: z
      .array(z.string())
      .min(1, "At least one product must be selected"),
    promotionType: z.enum(["FIXED_AMOUNT", "PERCENTAGE"], {
      errorMap: () => ({ message: "Promotion type is required" }),
    }),
    promotionValue: z
      .number()
      .min(0.01, "Promotion value must be greater than 0"),
    promotionFromDate: z
      .string()
      .min(1, "Promotion from date is required")
      .datetime("Invalid date format"),
    promotionToDate: z
      .string()
      .min(1, "Promotion to date is required")
      .datetime("Invalid date format"),
  })
  .refine(
    (data) => {
      // Validate that end date is after start date
      return (
        new Date(data.promotionToDate) > new Date(data.promotionFromDate)
      );
    },
    {
      message: "Promotion end date must be after start date",
      path: ["promotionToDate"],
    }
  )
  .refine(
    (data) => {
      // Validate promotion value based on type
      if (data.promotionType === "PERCENTAGE") {
        return data.promotionValue > 0 && data.promotionValue <= 100;
      }
      return data.promotionValue > 0;
    },
    {
      message:
        "Percentage must be between 0 and 100, fixed amount must be greater than 0",
      path: ["promotionValue"],
    }
  );

export type BulkPromotionFormData = z.infer<typeof bulkPromotionSchema>;
