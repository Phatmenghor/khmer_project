import {
  AccountStatus,
  BusinessStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  SubscriptionPlanDurationType,
  SubscriptionPlanStatus,
  UserRole,
} from "./status";

export const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
];

export const USER_PLATFORM_ROLE_CREATE_UPDATE = [
  { value: UserRole.PLATFORM_OWNER, label: "Platform Owner" },
  { value: UserRole.PLATFORM_ADMIN, label: "Platform Admin" },
  { value: UserRole.PLATFORM_USER, label: "Platform User" },
  { value: UserRole.SUPER_ADMIN, label: "Super Admin" },
  { value: UserRole.ADMIN, label: "Admin" },
];

export const USER_BUSINESS_ROLE_CREATE_UPDATE = [
  { value: UserRole.BUSINESS_OWNER, label: "Business Owner" },
  { value: UserRole.BUSINESS_ADMIN, label: "Business Admin" },
  { value: UserRole.BUSINESS_MANAGER, label: "Business Manager" },
  { value: UserRole.BUSINESS_EMPLOYEE, label: "Business Employee" },
  { value: UserRole.BUSINESS_USER, label: "Business User" },
];

export const USER_CUSTOMER_ROLE_CREATE_UPDATE = [
  { value: UserRole.CUSTOMER, label: "Customer" },
];

export const ACCOUNT_STATUS_CREATE_UPDATE = [
  { value: AccountStatus.ACTIVE, label: "Active" },
  { value: AccountStatus.END_WORK, label: "End Work" },
  { value: AccountStatus.LOCKED, label: "Locked" },
];

export const BUSINESS_STATUS_CREATE_UPDATE = [
  { value: BusinessStatus.ACTIVE, label: "Active" },
  { value: BusinessStatus.PENDING, label: "Pending" },
  { value: BusinessStatus.INACTIVE, label: "Inactive" },
  { value: BusinessStatus.SUSPENDED, label: "Subspended" },
];

export const SUBSCRIPTION_PLAN_CREATE_UPDATE = [
  { value: SubscriptionPlanStatus.PUBLIC, label: "Public" },
  { value: SubscriptionPlanStatus.PRIVATE, label: "Private" },
];

export const SUBSCRIPTION_PLAN_DURATION_TYPE_OPTIONS = [
  { value: SubscriptionPlanDurationType.FREE_TRIAL, label: "Free Trial (7 Days)" },
  { value: SubscriptionPlanDurationType.MONTHLY, label: "1 Month" },
  { value: SubscriptionPlanDurationType.SIX_MONTHS, label: "6 Months" },
  { value: SubscriptionPlanDurationType.YEARLY, label: "1 Year" },
];

export const SUBSCRIPTION_CREATE_UPDATE = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export const PAYMENT_STATUS_CREATE_UPDATE = [
  { value: PaymentStatus.PENDING, label: "Pending" },
  { value: PaymentStatus.COMPLETED, label: "Completed" },
  { value: PaymentStatus.FAILED, label: "Failed" },
  { value: PaymentStatus.CANCELLED, label: "Cancelled" },
];

export const PAYMENT_METHOD_CREATE_UPDATE = [
  { value: PaymentMethod.CASH, label: "Cash" },
  { value: PaymentMethod.BANK, label: "Bank Transfer" },
];

export const PAYMENT_TYPE_CREATE_UPDATE = [
  { value: PaymentType.SUBSCRIPTION, label: "Subscription" },
  { value: PaymentType.USER_PLAN, label: "User Plan" },
  { value: PaymentType.BUSINESS_RECORD, label: "Business Record" },
  { value: PaymentType.REFUND, label: "Refund" },
  { value: PaymentType.OTHER, label: "Other" },
];
