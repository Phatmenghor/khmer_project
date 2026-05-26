import { z } from "zod";

export const createUserSchema = z.object({
  userIdentifier: z
    .string()
    .min(1, "User identifier is required")
    .min(3, "User identifier must be at least 3 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s-()]+$/, "Invalid phone number format"),
  nickname: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  profileImageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  userType: z.string().min(1, "User type is required"),
  roles: z.array(z.string()).min(1, "At least one role is required"),
  accountStatus: z.string().min(1, "Account status is required"),
  remark: z.string().optional().or(z.literal("")),
});

export const updateUserSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s-()]+$/, "Invalid phone number format"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  nickname: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  profileImageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  accountStatus: z.string().min(1, "Account status is required"),
  roles: z.array(z.string()).min(1, "At least one role is required"),
  remark: z.string().optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type UserFormData = {
  id: string;
  userIdentifier?: string;
  email?: string;
  password?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nickname?: string;
  gender?: string;
  dateOfBirth?: string;
  profileImageUrl?: string;
  userType?: string;
  roles: string[];
  accountStatus: string;
  remark?: string;
};
