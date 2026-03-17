import { z } from "zod";

/**
 * Create Brand Schema
 */
export const createBrandSchema = z.object({
  name: z.string().min(1, "name is required"),
  imageUrl: z.string().min(1, "image url is required"),
  description: z.string().optional().or(z.literal("")),
  status: z.string().min(1, "status is required"),
});

/**
 * Update Brand Schema
 */
export const updateBrandSchema = z.object({
  name: z.string().min(1, "name is required"),
  imageUrl: z.string().min(1, "image url is required"),
  description: z.string().optional().or(z.literal("")),
  status: z.string().min(1, "status is required"),
});

export type CreateBrandData = z.infer<typeof createBrandSchema>;
export type UpdateBrandData = z.infer<typeof updateBrandSchema>;
