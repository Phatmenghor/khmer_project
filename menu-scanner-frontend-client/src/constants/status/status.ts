export enum Status {
  ALL = "ALL",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// Status configuration with descriptions and helper properties
export const StatusConfig = {
  [Status.ACTIVE]: {
    label: "Active",
    description: "Active",
  },
  [Status.INACTIVE]: {
    label: "Inactive",
    description: "Inactive",
  },
};

// Helper functions for Status enum
export const getStatusLabel = (status: Status): string => {
  return StatusConfig[status]?.label || status;
};

export const getStatusDescription = (status: Status): string => {
  return StatusConfig[status]?.description || status;
};

export const isActive = (status: Status): boolean => {
  return status === Status.ACTIVE;
};

export const isInactive = (status: Status): boolean => {
  return status === Status.INACTIVE;
};

export enum AccountStatus {
  ALL = "ALL",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  LOCKED = "LOCKED",
  SUSPENDED = "SUSPENDED",
}

// Types
export enum ModalMode {
  CREATE_MODE = "create",
  UPDATE_MODE = "update",
}

export enum UserRole {
  ALL = "ALL",

  PLATFORM_OWNER = "PLATFORM_OWNER",
  PLATFORM_ADMIN = "PLATFORM_ADMIN",
  PLATFORM_MANAGER = "PLATFORM_MANAGER",
  PLATFORM_SUPPORT = "PLATFORM_SUPPORT",

  BUSINESS_OWNER = "BUSINESS_OWNER",
  BUSINESS_MANAGER = "BUSINESS_MANAGER",
  BUSINESS_STAFF = "BUSINESS_STAFF",

  CUSTOMER = "CUSTOMER",
}

export enum UserPlatformRole {
  PLATFORM_OWNER = "PLATFORM_OWNER",
  PLATFORM_ADMIN = "PLATFORM_ADMIN",
  PLATFORM_MANAGER = "PLATFORM_MANAGER",
  PLATFORM_SUPPORT = "PLATFORM_SUPPORT",
}

export enum BusinessUserRole {
  BUSINESS_OWNER = "BUSINESS_OWNER",
  BUSINESS_MANAGER = "BUSINESS_MANAGER",
  BUSINESS_STAFF = "BUSINESS_STAFF",

  CUSTOMER = "CUSTOMER",
}

export enum SubscriptionPlanStatus {
  ALL = "ALL",
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

export enum UserGropeType {
  ALL = "ALL",
  PLATFORM_USER = "PLATFORM_USER",
  BUSINESS_USER = "BUSINESS_USER",
  CUSTOMER = "CUSTOMER",
}

export enum BusinessUserType {
  BUSINESS_USER = "BUSINESS_USER",
  CUSTOMER = "CUSTOMER",
}

export enum BusinessStatus {
  ALL = "ALL",
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum SubscriptionStatus {
  ALL = "ALL",
  SUBSCRIBED = "SUBSCRIBED",
  NONE_SUBSCRIBE = "NONE_SUBSCRIBE",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  EXPIRING_SOON = "EXPIRING_SOON",
}

export enum ExchangeRateStatus {
  ALL = "ALL",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum PaymentStatus {
  All = "ALL",
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  ONLINE = "ONLINE",
  OTHER = "OTHER",
}

export enum PaymentType {
  SUBSCRIPTION = "SUBSCRIPTION",
  USER_PLAN = "USER_PLAN",
  BUSINESS_RECORD = "BUSINESS_RECORD",
  REFUND = "REFUND",
  OTHER = "OTHER",
}

export enum ProductStatus {
  ALL = "ALL",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  OUT_OF_STOCK = "OUT_OF_STOCK",
}

export enum PromotionType {
  ALL = "ALL",
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
  NONE = "NONE",
}
