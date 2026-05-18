import { BusinessProfile, BusinessType } from "@/types/business-profile";

export const demoBusinessProfile: BusinessProfile = {
  id: "demo-business-001",
  slug: "my-business",
  businessName: "My Business",
  tagline: "Quality products and services",
  description: "Welcome to our business. We offer a wide range of products and services to meet your needs.",
  businessType: BusinessType.RETAIL,
  industry: "Retail",
  contact: {
    email: "contact@mybusiness.com",
    phone: "+855 12 345 678",
    whatsapp: "+855 12 345 678",
    address: {
      street: "123 Main Street",
      city: "Phnom Penh",
      state: "",
      country: "Cambodia",
      postalCode: "12000",
    },
  },
  isPublished: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
