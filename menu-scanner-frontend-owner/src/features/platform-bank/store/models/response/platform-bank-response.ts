import { Pagination } from "@/utils/common/pagination";

export interface PlatformBankResponseModel {
  id: string;
  name: string;
  accountName: string;
  accountNumber: string;
  description?: string;
  status: string;
  displayOrder: number;
  image?: {
    sm?: string;
    md?: string;
    o?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AllPlatformBankResponseModel extends Pagination {
  content: PlatformBankResponseModel[];
}
