import { z } from "zod";

export const createLocationSchema = z.object({
  label: z.string().min(1, "Label is required"),
  latitude: z.number(),
  longitude: z.number(),
  houseNumber: z.string().optional().default(""),
  streetNumber: z.string().optional().default(""),
  village: z.string().optional().default(""),
  commune: z.string().min(1, "Commune is required"),
  district: z.string().optional().default(""),
  province: z.string().optional().default(""),
  country: z.string().optional().default(""),
  note: z.string().optional().default(""),
  isPrimary: z.boolean().default(false),
  locationImages: z.array(z.object({ imageUrl: z.string() })).optional().default([]),
});

export type LocationFormData = z.infer<typeof createLocationSchema>;
