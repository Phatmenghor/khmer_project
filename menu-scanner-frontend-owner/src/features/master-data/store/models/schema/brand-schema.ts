import { z } from "zod";

const imageUrlsSchema = z.object({
  sm: z.string().optional(),
  md: z.string().optional(),
  o: z.string().optional(),
});

export const createBrandSchema = z.object({
  name: z.string().min(1, "name is required"),
  image: imageUrlsSchema.refine((v) => !!(v.sm || v.md || v.o), {
    message: "Brand image is required",
  }),
  description: z.string().optional().or(z.literal("")),
  status: z.string().min(1, "status is required"),
});

export const updateBrandSchema = createBrandSchema;

export type CreateBrandData = z.infer<typeof createBrandSchema>;
export type UpdateBrandData = z.infer<typeof updateBrandSchema>;
