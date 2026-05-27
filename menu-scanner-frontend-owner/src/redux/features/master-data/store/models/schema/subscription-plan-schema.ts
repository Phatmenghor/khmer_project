import { z } from "zod";
import { SubscriptionPlanDurationType } from "@/constants/app-resource/status/status";

/**
 * Create SubscriptionPlan Schema
 */
export const createSubscriptionPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  durationType: z.nativeEnum(SubscriptionPlanDurationType, {
    errorMap: () => ({ message: "Duration type is required" }),
  }),
  status: z.string().min(1, "Status is required"),
});

/**
 * Update SubscriptionPlan Schema
 */
export const updateSubscriptionPlanSchema = z.object({
  id: z.string().min(1, "Plan ID is required"),
  name: z.string().min(1, "Plan name is required"),
  description: z.string().optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  durationType: z.nativeEnum(SubscriptionPlanDurationType, {
    errorMap: () => ({ message: "Duration type is required" }),
  }),
  status: z.string().min(1, "Status is required"),
});

export type SubscriptionPlanFormData = {
  id?: string;
  name: string;
  description?: string;
  price: number;
  durationType: string;
  status: string;
};
