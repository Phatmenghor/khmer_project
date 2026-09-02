import {
  AccountStatus,
  BusinessStatus,
  ExchangeRateStatus,
  Status,
  SubscriptionPlanStatus,
  SubscriptionStatus,
  UserRole,
} from "./status";

export const USER_PLATFORM_ROLE_FILTER = [
  { value: UserRole.ALL, label: "All Roles" },
  { value: UserRole.PLATFORM_OWNER, label: "Platform Owner" },
  { value: UserRole.PLATFORM_ADMIN, label: "Platform Admin" },
  { value: UserRole.PLATFORM_USER, label: "Platform User" },
  { value: UserRole.SUPER_ADMIN, label: "Super Admin" },
  { value: UserRole.ADMIN, label: "Admin" },
];

export const USER_BUSINESS_ROLE_FILTER = [
  { value: UserRole.ALL, label: "All Roles" },
  { value: UserRole.BUSINESS_OWNER, label: "Business Owner" },
  { value: UserRole.BUSINESS_ADMIN, label: "Business Admin" },
  { value: UserRole.BUSINESS_MANAGER, label: "Business Manager" },
  { value: UserRole.BUSINESS_EMPLOYEE, label: "Business Employee" },
  { value: UserRole.BUSINESS_USER, label: "Business User" },
];

export const BUSINESS_FILTER = [
  { value: BusinessStatus.ALL, label: "All Status" },

  { value: BusinessStatus.ACTIVE, label: "Active" },
  { value: BusinessStatus.PENDING, label: "Pending" },
  { value: BusinessStatus.INACTIVE, label: "Inactive" },
  { value: BusinessStatus.SUSPENDED, label: "Subspended" },
];

export const HAS_SUBSCRIPTION_FILTER = [
  { value: SubscriptionStatus.ALL, label: "All" },
  { value: SubscriptionStatus.SUBSCRIBED, label: "Subscribed" },
  { value: SubscriptionStatus.NONE_SUBSCRIBE, label: "None Subscription" },
];

export const EXCHAGE_RATE_FILTER = [
  { value: ExchangeRateStatus.ALL, label: "All Status" },
  { value: ExchangeRateStatus.ACTIVE, label: "Active" },
  { value: ExchangeRateStatus.INACTIVE, label: "Inactive" },
];

export const SUBSCRIPTION_PLAN_FILTER = [
  { value: SubscriptionPlanStatus.ALL, label: "All" },
  { value: SubscriptionPlanStatus.PUBLIC, label: "Public" },
  { value: SubscriptionPlanStatus.PRIVATE, label: "Private" },
];

export const SUBSCRIPTION_STATUS_FILTER = [
  { value: SubscriptionStatus.ALL, label: "All Status" },
  { value: SubscriptionStatus.ACTIVE, label: "Active" },
  { value: SubscriptionStatus.EXPIRING_SOON, label: "Expiring Soon" },
  { value: SubscriptionStatus.EXPIRED, label: "Expired" },
  { value: SubscriptionStatus.CANCELLED, label: "Cancelled" },
  { value: SubscriptionStatus.CHANGE_PLAN, label: "Change Plan" },
];

export const SUBSCRIPTION_FILTER = SUBSCRIPTION_STATUS_FILTER;

// Auto renew filter options
export const AUTO_RENEW_FILTER = [
  { value: Status.ALL, label: "All Status" },
  { value: Status.ACTIVE, label: "Auto Renew" },
  { value: Status.INACTIVE, label: "Manual Renew" },
];

export const STATUS_FILTER = [
  { value: Status.ALL, label: "All Status" },
  { value: Status.ACTIVE, label: "Active" },
  { value: Status.INACTIVE, label: "Inactive" },
];



export const ACCOUNT_STATUS_FILTER = [
  { value: AccountStatus.ALL, label: "All Status" },
  { value: AccountStatus.ACTIVE, label: "Active" },
  { value: AccountStatus.END_WORK, label: "End Work" },
  { value: AccountStatus.LOCKED, label: "Locked" },
];
