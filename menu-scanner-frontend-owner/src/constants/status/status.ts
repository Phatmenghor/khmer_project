export enum Status {
  ALL = "ALL",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}


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


export const getStatusLabel = (status: Status): string => {
  return (StatusConfig as Record<string, { label: string }>)[status]?.label || status;
};

export const getStatusDescription = (status: Status): string => {
  return (StatusConfig as Record<string, { description: string }>)[status]?.description || status;
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
  END_WORK = "END_WORK",
  LOCKED = "LOCKED",
}


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
  PLATFORM_SUPPORT = "  ",
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
  PAID = "PAID",
  UNPAID = "UNPAID",
  REFUNDED = "REFUNDED",
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


export const ProductStatusConfig = {
  [ProductStatus.ACTIVE]: {
    label: "Active",
  },
  [ProductStatus.INACTIVE]: {
    label: "Inactive",
  },
  [ProductStatus.OUT_OF_STOCK]: {
    label: "Out of Stock",
  },
};


export const getProductStatusLabel = (status: string): string => {
  return (ProductStatusConfig as Record<string, { label: string }>)[status]?.label || status;
};

export enum StockStatus {
  ENABLED = "ENABLED",
  DISABLED = "DISABLED",
}


export const StockStatusConfig = {
  [StockStatus.ENABLED]: {
    label: "Enabled",
  },
  [StockStatus.DISABLED]: {
    label: "Disabled",
  },
};


export const getStockStatusLabel = (status: string): string => {
  return (StockStatusConfig as Record<string, { label: string }>)[status]?.label || status;
};

export enum PromotionType {
  ALL = "ALL",
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
  NONE = "NONE",
}

export enum PromotionStatus {
  NONE = "NONE",
  ACTIVE = "ACTIVE",
  FUTURE_PROMOTION = "FUTURE_PROMOTION",
}

export const PromotionStatusConfig = {
  [PromotionStatus.NONE]: {
    label: "No Promotion",
    variant: "secondary" as const,
  },
  [PromotionStatus.ACTIVE]: {
    label: "Active Promotion",
    variant: "destructive" as const,
  },
  [PromotionStatus.FUTURE_PROMOTION]: {
    label: "Scheduled Promotion",
    variant: "outline" as const,
  },
};

export const isPromotionActive = (hasPromotion?: string | boolean | null): boolean => {
  if (!hasPromotion) return false;
  return hasPromotion === true || hasPromotion === PromotionStatus.ACTIVE || hasPromotion === "ACTIVE";
};

export const isPromotionScheduled = (hasPromotion?: string | boolean | null): boolean => {
  if (!hasPromotion) return false;
  return hasPromotion === PromotionStatus.FUTURE_PROMOTION || hasPromotion === "FUTURE_PROMOTION";
};

export const hasAnyPromotion = (hasPromotion?: string | boolean | null): boolean => {
  return isPromotionActive(hasPromotion) || isPromotionScheduled(hasPromotion);
};

export enum POSPromotionFilterKey {
  ALL = "ALL",
  ON_SALE = "ON_SALE",
  STANDARD = "STANDARD",
}

export const POS_PROMOTION_FILTER_OPTIONS = [
  { value: POSPromotionFilterKey.ALL, label: "All Items" },
  { value: POSPromotionFilterKey.ON_SALE, label: "On Promotion" },
  { value: POSPromotionFilterKey.STANDARD, label: "Regular Price" },
];

export const getPOSPromotionFilterValue = (promotionFilter?: boolean): POSPromotionFilterKey => {
  if (promotionFilter === undefined) return POSPromotionFilterKey.ALL;
  return promotionFilter ? POSPromotionFilterKey.ON_SALE : POSPromotionFilterKey.STANDARD;
};

export const getPromotionFilterFromKey = (key: string): boolean | undefined => {
  if (key === POSPromotionFilterKey.ON_SALE) return true;
  if (key === POSPromotionFilterKey.STANDARD) return false;
  return undefined;
};

/* ── Table Status Constants ── */
export interface TableStatusConfig {
  value: string;
  label: string;
  badgeClass: string;
  iconColor: string;
  isSelectableManually: boolean;
}

export const TABLE_STATUS_CONFIG_MAP: Record<string, TableStatusConfig> = {
  AVAILABLE: {
    value: "AVAILABLE",
    label: "🟢 Available",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    iconColor: "text-emerald-500",
    isSelectableManually: true,
  },
  OCCUPIED: {
    value: "OCCUPIED",
    label: "🔴 Occupied",
    badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
    iconColor: "text-red-500",
    isSelectableManually: false,
  },
  RESERVED: {
    value: "RESERVED",
    label: "🟣 Reserved",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    iconColor: "text-purple-500",
    isSelectableManually: true,
  },
  MAINTENANCE: {
    value: "MAINTENANCE",
    label: "🟡 Maintenance",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    iconColor: "text-amber-500",
    isSelectableManually: true,
  },
};

/** Manually selectable status options for forms (excluding OCCUPIED) */
export const MANUALLY_SELECTABLE_TABLE_STATUS_OPTIONS = Object.values(TABLE_STATUS_CONFIG_MAP)
  .filter((config) => config.isSelectableManually)
  .map((config) => ({
    value: config.value,
    label: config.label,
  }));

/** All Table Status select options (including OCCUPIED) */
export const ALL_TABLE_STATUS_OPTIONS = Object.values(TABLE_STATUS_CONFIG_MAP).map((config) => ({
  value: config.value,
  label: config.label,
}));

/** Helper to retrieve badge CSS class for any table status */
export function getTableStatusBadgeClass(status: string): string {
  const key = status?.toUpperCase();
  return (
    TABLE_STATUS_CONFIG_MAP[key]?.badgeClass ||
    "bg-muted text-muted-foreground border-border/60"
  );
}

/** Helper to retrieve label with emoji icon for table status */
export function getTableStatusLabel(status: string): string {
  const key = status?.toUpperCase();
  return TABLE_STATUS_CONFIG_MAP[key]?.label || status;
}
