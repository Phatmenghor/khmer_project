import { Pagination } from "@/utils/common/pagination";

export interface AllRoleResponseModel extends Pagination {
  content: RoleResponseModel[];
}

export interface RoleResponseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  name: string;
  description: string;
  businessId: string;
  userType: string;
}
