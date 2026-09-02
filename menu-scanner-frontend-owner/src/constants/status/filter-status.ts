import {
  AccountStatus,
  BusinessStatus,
  ExchangeRateStatus,
  ProductStatus,
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

export const SUBSCRIPTION_STATUS_FILTER = [
  { value: SubscriptionStatus.ALL, label: "All Status" },
  { value: SubscriptionStatus.ACTIVE, label: "Active" },
  { value: SubscriptionStatus.EXPIRING_SOON, label: "Expiring Soon" },
  { value: SubscriptionStatus.EXPIRED, label: "Expired" },
  { value: SubscriptionStatus.CANCELLED, label: "Cancelled" },
  { value: SubscriptionStatus.CHANGE_PLAN, label: "Change Plan" },
];

export const EXCHAGE_RATE_FILTER = [
  { value: ExchangeRateStatus.ALL, label: "All Status" },
  { value: ExchangeRateStatus.ACTIVE, label: "Active" },
  { value: ExchangeRateStatus.INACTIVE, label: "Inactive" },
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

export const PRODUCT_STATUS_FILTER = [
  { value: ProductStatus.ALL, label: "All Status" },
  { value: ProductStatus.ACTIVE, label: "Active" },
  { value: ProductStatus.INACTIVE, label: "Draft" },
  { value: ProductStatus.OUT_OF_STOCK, label: "Out of Stock" },
];



export const SORT_BY_OPTIONS = [
  { value: "createdAt", label: "Created Date" },
  { value: "displayPrice", label: "Display Price" },
  { value: "barcode", label: "Barcode" },
  { value: "sku", label: "SKU" },
  { value: "totalStock", label: "Total Stock" },
  { value: "favoriteCount", label: "Favorite Count" },
  { value: "viewCount", label: "View Count" },
];

export const SORT_DIRECTION_OPTIONS = [
  { value: "DESC", label: "High to Low (DESC)" },
  { value: "ASC", label: "Low to High (ASC)" },
];
