import { z } from "zod";

const imageUrlsSchema = z.object({
  sm: z.string().optional(),
  md: z.string().optional(),
  o: z.string().optional(),
});

export const createDeliveryOptionsSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .refine(
      (val) => {
        const n = val.trim().toLowerCase();
        return n !== "store pickup" && n !== "pickup";
      },
      { message: "Store Pickup is a default option and cannot be created again" }
    ),
  image: imageUrlsSchema.optional(),
  description: z.string().optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Price must be greater than or equal to 0"),
  status: z.string().min(1, "Status is required"),
});

export const updateDeliveryOptionsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: imageUrlsSchema.optional(),
  description: z.string().optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Price must be greater than or equal to 0"),
  status: z.string().min(1, "Status is required"),
});

export type CreateDeliveryOptionsData = z.infer<
  typeof createDeliveryOptionsSchema
>;

export type UpdateDeliveryOptionsData = z.infer<
  typeof updateDeliveryOptionsSchema
>;
