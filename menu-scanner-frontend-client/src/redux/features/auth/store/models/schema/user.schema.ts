// user.schema.ts
import { z } from "zod";

/**
 * Create User Schema
 */
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
  profileImageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  userType: z.string().min(1, "User type is required"),
  businessId: z.string().optional().or(z.literal("")),
  roles: z.array(z.string()).min(1, "At least one role is required"),
  accountStatus: z.string().min(1, "Account status is required"),
  // Personal Info
  nickname: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  // Employment Info
  employeeId: z.string().optional().or(z.literal("")),
  position: z.string().optional().or(z.literal("")),
  department: z.string().optional().or(z.literal("")),
  employmentType: z.string().optional().or(z.literal("")),
  joinDate: z.string().optional().or(z.literal("")),
  leaveDate: z.string().optional().or(z.literal("")),
  shift: z.string().optional().or(z.literal("")),
  // Other
  remark: z.string().optional().or(z.literal("")),
});

/**
 * Update User Schema
 */
export const updateUserSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s-()]+$/, "Invalid phone number format"),
  profileImageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  accountStatus: z.string().min(1, "Account status is required"),
  businessId: z.string().optional().or(z.literal("")),
  roles: z.array(z.string()).min(1, "At least one role is required"),
  // Personal Info
  nickname: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  // Employment Info
  employeeId: z.string().optional().or(z.literal("")),
  position: z.string().optional().or(z.literal("")),
  department: z.string().optional().or(z.literal("")),
  employmentType: z.string().optional().or(z.literal("")),
  joinDate: z.string().optional().or(z.literal("")),
  leaveDate: z.string().optional().or(z.literal("")),
  shift: z.string().optional().or(z.literal("")),
  // Other
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

/**
 * Combined form data type - includes all possible fields
 */
export type UserFormData = {
  id: string;
  userIdentifier?: string;
  email?: string;
  password?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profileImageUrl?: string;
  userType?: string;
  businessId?: string;
  roles: string[];
  accountStatus: string;
  // Personal Info
  nickname?: string;
  gender?: string;
  dateOfBirth?: string;
  // Employment Info
  employeeId?: string;
  position?: string;
  department?: string;
  employmentType?: string;
  joinDate?: string;
  leaveDate?: string;
  shift?: string;
  // Other
  remark?: string;
  // Address (Optional - single)
  addressType?: string;
  houseNo?: string;
  street?: string;
  village?: string;
  commune?: string;
  district?: string;
  province?: string;
  country?: string;
  // Emergency Contact (Optional - single)
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  // Document (Optional - single)
  documentType?: string;
  documentNumber?: string;
  documentFileUrl?: string;
  // Education (Optional - single)
  educationLevel?: string;
  schoolName?: string;
  fieldOfStudy?: string;
  startYear?: string;
  endYear?: string;
  certificateUrl?: string;
  // Array fields (for API responses)
  addresses?: any[];
  emergencyContacts?: any[];
  documents?: any[];
  educations?: any[];
};
