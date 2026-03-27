// user.schema.ts
import { z } from "zod";

/**
 * Address Type
 */
export interface Address {
  id?: string;
  addressType: string;
  houseNo: string;
  street: string;
  village: string;
  commune: string;
  district: string;
  province: string;
  country: string;
}

/**
 * Emergency Contact Type
 */
export interface EmergencyContact {
  id?: string;
  name: string;
  phone: string;
  relationship: string;
}

/**
 * Document Type
 */
export interface Document {
  id?: string;
  type: string;
  number: string;
  fileUrl: string;
}

/**
 * Education Type
 */
export interface Education {
  id?: string;
  level: string;
  schoolName: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  isGraduated: boolean;
  certificateUrl: string;
}

/**
 * Address Schema for form validation
 */
export const addressSchema = z.object({
  id: z.string().optional(),
  addressType: z.string().min(1, "Address type is required"),
  houseNo: z.string().optional().or(z.literal("")),
  street: z.string().optional().or(z.literal("")),
  village: z.string().optional().or(z.literal("")),
  commune: z.string().optional().or(z.literal("")),
  district: z.string().optional().or(z.literal("")),
  province: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
});

/**
 * Emergency Contact Schema for form validation
 */
export const emergencyContactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Contact name is required"),
  phone: z.string().min(1, "Phone number is required"),
  relationship: z.string().min(1, "Relationship is required"),
});

/**
 * Document Schema for form validation
 */
export const documentSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1, "Document type is required"),
  number: z.string().min(1, "Document number is required"),
  fileUrl: z.string().optional().or(z.literal("")),
});

/**
 * Education Schema for form validation
 */
export const educationSchema = z.object({
  id: z.string().optional(),
  level: z.string().min(1, "Education level is required"),
  schoolName: z.string().min(1, "School name is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  startYear: z.string().optional().or(z.literal("")),
  endYear: z.string().optional().or(z.literal("")),
  isGraduated: z.boolean().default(false),
  certificateUrl: z.string().optional().or(z.literal("")),
});

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
  firstName: z.string().optional().or(z.literal("")),
  lastName: z.string().optional().or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
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
  // Array fields
  addresses: z.array(addressSchema).optional(),
  emergencyContacts: z.array(emergencyContactSchema).optional(),
  documents: z.array(documentSchema).optional(),
  educations: z.array(educationSchema).optional(),
});

/**
 * Update User Schema
 */
export const updateUserSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  firstName: z.string().optional().or(z.literal("")),
  lastName: z.string().optional().or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
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
  // Array fields
  addresses: z.array(addressSchema).optional(),
  emergencyContacts: z.array(emergencyContactSchema).optional(),
  documents: z.array(documentSchema).optional(),
  educations: z.array(educationSchema).optional(),
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
  // Array fields
  addresses?: Address[];
  emergencyContacts?: EmergencyContact[];
  documents?: Document[];
  educations?: Education[];
};
