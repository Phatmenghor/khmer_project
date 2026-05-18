import { z } from "zod";

/**
 * Create DeliveryOptions Schema
 */
export const createDeliveryOptionsSchema = z.object({
  name: z.string().min(1, "name is required"),
  imageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  price: z.number().min(0, "USD To KHR rate must be greater than or equal 0"),
  status: z.string().min(1, "Status is required"),
});

/**
 * Update DeliveryOptions Schema
 */
export const updateDeliveryOptionsSchema = z.object({
  name: z.string().min(1, "name is required"),
  imageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  price: z.number().min(0, "USD To KHR rate must be greater than or equal 0"),
  status: z.string().min(1, "Status is required"),
});

export type CreateDeliveryOptionsData = z.infer<
  typeof createDeliveryOptionsSchema
>;

export type UpdateDeliveryOptionsData = z.infer<
  typeof updateDeliveryOptionsSchema
>;
