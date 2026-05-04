import { z } from "zod";

/**
 * Create Subcategories Schema
 */
export const createSubcategoriesSchema = z.object({
  categoryId: z.string().min(1, "category is required"),
  name: z.string().min(1, "name is required"),
  imageUrl: z.string().min(1, "image url is required"),
  status: z.string().min(1, "status is required"),
});

/**
 * Update Subcategories Schema
 */
export const updateSubcategoriesSchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().min(1, "name is required"),
  imageUrl: z.string().min(1, "image url is required"),
  status: z.string().min(1, "status is required"),
});

export type CreateSubcategoriesData = z.infer<typeof createSubcategoriesSchema>;
export type UpdateSubcategoriesData = z.infer<typeof updateSubcategoriesSchema>;
