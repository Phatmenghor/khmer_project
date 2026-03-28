import { z } from "zod";

/**
 * Create Banner Schema
 */
export const createBannerSchema = z.object({
  imageUrl: z.string().min(1, "Image URL is required"),
  title: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  linkUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  status: z.string().min(1, "Status is required"),
});

/**
 * Update Banner Schema
 */
export const updateBannerSchema = z.object({
  imageUrl: z.string().min(1, "Image URL is required"),
  title: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  linkUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  status: z.string().min(1, "Status is required"),
});

export type CreateBannerData = z.infer<typeof createBannerSchema>;
export type UpdateBannerData = z.infer<typeof updateBannerSchema>;
