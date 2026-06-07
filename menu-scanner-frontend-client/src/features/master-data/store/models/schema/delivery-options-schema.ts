import { z } from "zod";

const imageUrlsSchema = z.object({
  sm: z.string().optional(),
  md: z.string().optional(),
  o: z.string().optional(),
});

export const createDeliveryOptionsSchema = z.object({
  name: z.string().min(1, "name is required"),
  image: imageUrlsSchema.optional(),
  description: z.string().optional().or(z.literal("")),
  price: z.number().min(0, "USD To KHR rate must be greater than or equal 0"),
  status: z.string().min(1, "Status is required"),
});

export const updateDeliveryOptionsSchema = createDeliveryOptionsSchema;

export type CreateDeliveryOptionsData = z.infer<
  typeof createDeliveryOptionsSchema
>;

export type UpdateDeliveryOptionsData = z.infer<
  typeof updateDeliveryOptionsSchema
>;
