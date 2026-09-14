export interface BakongConfigModel {
  id: string;
  configName: string;
  apiUrl: string;
  email: string;
  dailyRateLimit: number;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BakongAccountModel {
  id: string;
  accountId: string;
  merchantName: string;
  merchantCity?: string;
  acquiringBank?: string;
  currency?: string;
  isDefault: boolean;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BakongTransactionModel {
  id: string;
  projectCode?: string;
  apiKey?: string;
  md5: string;
  hash?: string;
  amount: number;
  currency: string;
  status: string;
  fromAccountId?: string;
  toAccountId?: string;
  merchantName?: string;
  rawQrString?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BakongTransactionLogModel {
  id: string;
  transactionId?: string;
  projectCode?: string;
  apiKey?: string;
  md5?: string;
  hash?: string;
  action: string;
  status: string;
  amount?: number;
  currency?: string;
  fromAccountId?: string;
  toAccountId?: string;
  merchantName?: string;
  errorMessage?: string;
  createdAt?: string;
}

export interface AccountQuotaDetail {
  configName: string;
  email: string;
  usedCount: number;
  maxLimit: number;
  remainingQuota: number;
  usagePercentage: number;
  active: boolean;
  limitReached: boolean;
}

export interface DailyQuotaInfo {
  activeEmail: string;
  email: string;
  date: string;
  usedCount: number;
  maxLimit: number;
  remainingQuota: number;
  usagePercentage: number;
  resetTimezone: string;
  accounts: AccountQuotaDetail[];
}

export interface TokenStatusInfo {
  email: string;
  active: boolean;
  expiresAt: string;
  remainingSeconds: number;
  tokenSource: string;
}

export interface BakongMonitoringStatusModel {
  quota: DailyQuotaInfo;
  token: TokenStatusInfo;
}

export interface BakongVerifyResponseModel {
  searchedLocal: boolean;
  source: "DATABASE" | "NBC_UPSTREAM";
  message: string;
  transaction?: BakongTransactionModel;
  logs?: BakongTransactionLogModel[];
}
