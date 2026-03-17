import { BasePagination } from "@/utils/common/pagination";

export interface AllWorkScheduleTypeResponseModel extends BasePagination {
  content: WorkScheduleTypeResponseModel[];
}

export interface WorkScheduleTypeResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  businessId: string;
  enumName: string;
  description: string;
}
