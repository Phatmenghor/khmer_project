import {
  AccountStatus,
  BusinessStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  ProductStatus,
  PromotionType,
  Status,
  SubscriptionPlanStatus,
  UserRole,
} from "./status";

export const USER_PLATFORM_ROLE_CREATE_UPDATE = [
  { value: UserRole.PLATFORM_OWNER, label: "Platform Owner" },
  { value: UserRole.PLATFORM_ADMIN, label: "Platform Admin" },
  { value: UserRole.PLATFORM_MANAGER, label: "Platform Manager" },
  { value: UserRole.PLATFORM_SUPPORT, label: "Platform Support" },
];

export const USER_BUSINESS_ROLE_CREATE_UPDATE = [
  { value: UserRole.BUSINESS_OWNER, label: "Business Owner" },
  { value: UserRole.BUSINESS_MANAGER, label: "Business Manager" },
  { value: UserRole.BUSINESS_STAFF, label: "Business Staff" },
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
  { value: PaymentMethod.BANK_TRANSFER, label: "Bank Transfer" },
  { value: PaymentMethod.ONLINE, label: "Online" },
  { value: PaymentMethod.OTHER, label: "Other" },
];

export const PAYMENT_TYPE_CREATE_UPDATE = [
  { value: PaymentType.SUBSCRIPTION, label: "Subscription" },
  { value: PaymentType.USER_PLAN, label: "User Plan" },
  { value: PaymentType.BUSINESS_RECORD, label: "Business Record" },
  { value: PaymentType.REFUND, label: "Refund" },
  { value: PaymentType.OTHER, label: "Other" },
];

export const BANNER_STATUS_CREATE_UPDATE = [
  { value: Status.ACTIVE, label: "Active" },
  { value: Status.INACTIVE, label: "Draft" },
];

export const DELIVERY_OPTIONS_STATUS_CREATE_UPDATE = [
  { value: Status.ACTIVE, label: "Active" },
  { value: Status.INACTIVE, label: "Draft" },
];

export const ORDER_STATUS_CREATE_UPDATE = [
  { value: Status.ACTIVE, label: "Active" },
  { value: Status.INACTIVE, label: "Draft" },
];

export const PRODUCT_STATUS_CREATE_UPDATE = [
  { value: ProductStatus.ACTIVE, label: "Active" },
  { value: ProductStatus.INACTIVE, label: "Draft" },
  { value: ProductStatus.OUT_OF_STOCK, label: "Out of Stock" },
];

export const PROMOTION_TYPE_CREATE_UPDATE = [
  { value: PromotionType.NONE, label: "No Promotion" },
  { value: PromotionType.PERCENTAGE, label: "Percentage" },
  { value: PromotionType.FIXED_AMOUNT, label: "Fixed Amount" },
];
