import { z } from "zod";

const imageUrlsSchema = z.object({
  sm: z.string().optional(),
  md: z.string().optional(),
  o: z.string().optional(),
}).optional();

export const portfolioFormSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  description: z.string().min(1, "Description is required"),
  logo: imageUrlsSchema,
  coverImage: imageUrlsSchema,

  contact: z.object({
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
    phones: z.array(
      z.object({
        id: z.string().optional(),
        number: z.string().min(1, "Phone number is required"),
      })
    ).optional(),
    whatsapp: z.string().optional(),
    telegram: z.string().optional(),
    address: z.string().optional(),
    mapLink: z.string().optional(),
  }).optional(),

  socialMedia: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Social media name is required"),
      url: z.string().url("Invalid URL"),
    })
  ).optional(),

  businessHours: z.array(
    z.object({
      id: z.string().optional(),
      day: z.string(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    })
  ).optional(),

  gallery: z.array(
    z.object({
      id: z.string().optional(),
      image: imageUrlsSchema,
      title: z.string().optional(),
    })
  ).optional(),

  services: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Service name is required"),
      description: z.string().optional(),
    })
  ).optional(),

  team: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Team member name is required"),
      position: z.string().min(1, "Position is required"),
      bio: z.string().optional(),
      photo: imageUrlsSchema,
    })
  ).optional(),

  features: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Feature name is required"),
    })
  ).optional(),

  customStats: z.array(
    z.object({
      id: z.string().optional(),
      label: z.string().min(1, "Stat label is required"),
      value: z.string().min(1, "Stat value is required"),
    })
  ).optional(),
});

export type PortfolioFormData = z.infer<typeof portfolioFormSchema>;
