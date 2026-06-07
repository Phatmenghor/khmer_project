
import { z } from "zod";


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


export interface EmergencyContact {
  id?: string;
  name: string;
  phone: string;
  relationship: string;
}


export interface Document {
  id?: string;
  type: string;
  number: string;
  fileUrl: string;
}


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


export const emergencyContactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Contact name is required"),
  phone: z.string().min(1, "Phone number is required"),
  relationship: z.string().min(1, "Relationship is required"),
});


export const documentSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1, "Document type is required"),
  number: z.string().min(1, "Document number is required"),
  fileUrl: z.string().optional().or(z.literal("")),
});


export const educationSchema = z.object({
  id: z.string().optional(),
  level: z.string().min(1, "Education level is required"),
  schoolName: z.string().min(1, "School name is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  startYear: z.string().optional().or(z.literal("")),
  endYear: z.string().optional().or(z.literal("")),
  // The select field stores "true"/"false" as strings; accept either and
  // coerce to boolean so the API receives a real boolean.
  isGraduated: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === "true")
    .default(false),
  certificateUrl: z.string().optional().or(z.literal("")),
});


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
  profileImageUrl: z.string().optional().or(z.literal("")),
  userType: z.string().min(1, "User type is required"),
  businessId: z.string().optional().or(z.literal("")),
  roles: z.array(z.string()).min(1, "At least one role is required"),
  accountStatus: z.string().min(1, "Account status is required"),

  nickname: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),

  employeeId: z.string().optional().or(z.literal("")),
  position: z.string().optional().or(z.literal("")),
  department: z.string().optional().or(z.literal("")),
  employmentType: z.string().optional().or(z.literal("")),
  joinDate: z.string().optional().or(z.literal("")),
  leaveDate: z.string().optional().or(z.literal("")),
  shift: z.string().optional().or(z.literal("")),

  remark: z.string().optional().or(z.literal("")),

  addresses: z.array(addressSchema).optional(),
  emergencyContacts: z.array(emergencyContactSchema).optional(),
  documents: z.array(documentSchema).optional(),
  educations: z.array(educationSchema).optional(),
});


export const updateUserSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  firstName: z.string().optional().or(z.literal("")),
  lastName: z.string().optional().or(z.literal("")),
  email: z.string().optional().or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
  profileImageUrl: z.string().optional().or(z.literal("")),
  accountStatus: z.string().optional().or(z.literal("")),
  businessId: z.string().optional().or(z.literal("")),
  roles: z.array(z.string()).optional(),

  nickname: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),

  employeeId: z.string().optional().or(z.literal("")),
  position: z.string().optional().or(z.literal("")),
  department: z.string().optional().or(z.literal("")),
  employmentType: z.string().optional().or(z.literal("")),
  joinDate: z.string().optional().or(z.literal("")),
  leaveDate: z.string().optional().or(z.literal("")),
  shift: z.string().optional().or(z.literal("")),

  remark: z.string().optional().or(z.literal("")),

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

  nickname?: string;
  gender?: string;
  dateOfBirth?: string;

  employeeId?: string;
  position?: string;
  department?: string;
  employmentType?: string;
  joinDate?: string;
  leaveDate?: string;
  shift?: string;

  remark?: string;

  addresses?: Address[];
  emergencyContacts?: EmergencyContact[];
  documents?: Document[];
  educations?: Education[];
};
