import { z } from "zod";

/**
 * Create Order Status Schema
 */
export const createOrderStatusSchema = z.object({
  name: z.string().min(1, "name is required"),
  description: z.string().optional().or(z.literal("")),
  status: z.string().min(1, "Status is required"),
});

/**
 * Update Order Status Schema
 */
export const updateOrderStatusSchema = z.object({
  name: z.string().min(1, "name is required"),
  description: z.string().optional().or(z.literal("")),
  status: z.string().min(1, "Status is required"),
});

export type CreateOrderStatusData = z.infer<typeof createOrderStatusSchema>;

export type UpdateOrderStatusData = z.infer<typeof updateOrderStatusSchema>;
