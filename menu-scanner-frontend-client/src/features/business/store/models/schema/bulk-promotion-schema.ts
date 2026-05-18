import { z } from "zod";

/**
 * Validates ISO 8601 date strings and datetime-local formats
 */
const dateTimeSchema = z
  .string()
  .min(1, "Date is required")
  .refine(
    (date) => {
      try {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
      } catch {
        return false;
      }
    },
    { message: "Invalid date format" }
  );

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
      .coerce.number()
      .min(0.01, "Promotion value must be greater than 0"),
    promotionFromDate: dateTimeSchema,
    promotionToDate: dateTimeSchema,
  })
  .refine(
    (data) => {
      try {
        const fromDate = new Date(data.promotionFromDate);
        const toDate = new Date(data.promotionToDate);
        return toDate > fromDate;
      } catch {
        return false;
      }
    },
    {
      message: "Promotion end date must be after start date",
      path: ["promotionToDate"],
    }
  )
  .refine(
    (data) => {
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
