/**
 * User business owner Request Types
 */

import { BaseGetAllRequest } from "@/utils/common/get-all-request";
import {
  CancelSubscriptionData,
  ChangePlanData,
  RenewSubscriptionData,
} from "../schema/business-owner.schema";

/**
 * Fetch All User business owner Request
 */
export interface AllBusinessOwnerRequest extends BaseGetAllRequest {
  subscriptionStatuses?: string[];
  autoRenew?: boolean;
  expiringSoonDays?: number;
  userType?: string;
  userTypes?: string[];
  userGroupType?: string;
  userGroupTypes?: string[];
  userGropeType?: string;
  userGropeTypes?: string[];
  roles?: string[];
  role?: string;
  includeAll?: boolean;
}

export interface UpdateBusinessOwnerRequest {
  ownerFullName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerAccountStatus?: string;
  businessName?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  businessStatus?: string;
  autoRenew?: boolean;
}

export interface UpdateBusinessOwnerParams {
  ownerId: string;
  data: UpdateBusinessOwnerRequest;
}

export interface UpdateBusinessOwnerChangePlanParams {
  ownerId: string;
  businessOwnerData: ChangePlanData;
}

export interface UpdateBusinessOwnerRenewParams {
  ownerId: string;
  businessOwnerData: RenewSubscriptionData;
}

export interface UpdateBusinessOwnerCancelParams {
  ownerId: string;
  businessOwnerData: CancelSubscriptionData;
}
