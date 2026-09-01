import { z } from "zod";

const imageUrlsSchema = z.object({
  sm: z.string().optional(),
  md: z.string().optional(),
  o: z.string().optional(),
});

export const createCategoriesSchema = z.object({
  name: z.string().min(1, "name is required"),
  image: imageUrlsSchema.refine((v) => !!(v.sm || v.md || v.o), {
    message: "Category image is required",
  }),
  description: z.string().optional(),
  status: z.string().min(1, "status is required"),
});

export const updateCategoriesSchema = createCategoriesSchema;

export type CreateCategoriesData = z.infer<typeof createCategoriesSchema>;
export type UpdateCategoriesData = z.infer<typeof updateCategoriesSchema>;
