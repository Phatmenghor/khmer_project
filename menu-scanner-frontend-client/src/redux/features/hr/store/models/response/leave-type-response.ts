import { BasePagination } from "@/utils/common/pagination";

export interface AllLeaveTypeResponseModel extends BasePagination {
  content: LeaveTypeResponseModel[];
}

export interface LeaveTypeResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  businessId: string;
  enumName: string;
  description: string;
}
