import { z } from "zod";

const imageUrlsSchema = z.object({
  sm: z.string().optional(),
  md: z.string().optional(),
  o: z.string().optional(),
});

export const createBannerSchema = z.object({
  image: imageUrlsSchema.refine((v) => !!(v.sm || v.md || v.o), {
    message: "Banner image is required",
  }),
  description: z.string().optional().or(z.literal("")),
  status: z.string().min(1, "Status is required"),
});

export const updateBannerSchema = createBannerSchema;

export type CreateBannerData = z.infer<typeof createBannerSchema>;
export type UpdateBannerData = z.infer<typeof updateBannerSchema>;
