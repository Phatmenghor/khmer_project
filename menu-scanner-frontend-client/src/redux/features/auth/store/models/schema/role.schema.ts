import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1, "Role name is required").min(2, "Role name must be at least 2 characters"),
  description: z.string().optional().or(z.literal("")),
});

export const updateRoleSchema = z.object({
  id: z.string().min(1, "Role id is required"),
  name: z.string().min(1, "Role name is required").min(2, "Role name must be at least 2 characters"),
  description: z.string().optional().or(z.literal("")),
});

export type RoleFormData = {
  id: string;
  name?: string;
  userType?: string;
  businessId?: string;
  description: string;
};
