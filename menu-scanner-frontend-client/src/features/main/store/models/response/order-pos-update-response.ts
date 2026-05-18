/**
 * POS Order Update Response Models
 * Returned when admin updates an order from POS
 */

import { OrderResponse } from './order-response';
import { OrderUpdateHistoryResponse } from '../type/order-update-history-type';

export interface UpdateOrderFromPOSResponse {
  success: boolean;
  message: string;
  order: OrderResponse; // Updated order
  updateHistory: OrderUpdateHistoryResponse; // What changed
  requiresConfirmation: boolean; // true if order went to PENDING_POS_CONFIRMATION
  statusBefore: string;
  statusAfter: string;
}

export interface ConfirmPOSOrderChangesResponse {
  success: boolean;
  message: string;
  order: OrderResponse;
  confirmed: boolean;
  statusBefore: string;
  statusAfter: string;
  confirmedAt: string;
  confirmedBy: {
    userId: string;
    name: string;
  };
}

export interface OrderUpdateHistoryListResponse {
  orderId: string;
  totalUpdates: number;
  updates: OrderUpdateHistoryResponse[];
}
