import { z } from "zod";

export const portfolioFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  logoUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),

  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  contactPhones: z.array(
    z.object({
      id: z.string().optional(),
      number: z.string().min(1, "Phone number is required"),
    })
  ).optional(),
  contactWhatsapp: z.string().optional(),
  contactTelegram: z.string().optional(),
  address: z.string().optional(),
  mapLink: z.string().optional(),

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
      url: z.string().min(1, "Gallery image URL is required"),
      title: z.string().optional(),
      description: z.string().optional(),
    })
  ).optional(),

  services: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Service name is required"),
      description: z.string().min(1, "Service description is required"),
    })
  ).optional(),

  team: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Team member name is required"),
      position: z.string().min(1, "Position is required"),
      bio: z.string().optional(),
      photoUrl: z.string().optional(),
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
