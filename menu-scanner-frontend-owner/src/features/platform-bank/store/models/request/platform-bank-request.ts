export interface PlatformBankRequestModel {
  name: string;
  accountName: string;
  accountNumber: string;
  description?: string;
  status?: string;
  displayOrder?: number;
  image?: {
    sm?: string;
    md?: string;
    o?: string;
  } | null;
}

export interface AllPlatformBankRequestModel {
  search?: string;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}
