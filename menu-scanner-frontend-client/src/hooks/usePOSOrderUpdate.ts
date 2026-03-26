/**
 * usePOSOrderUpdate Hook
 * Manages updates to existing orders from POS
 * For creating NEW orders from POS, use usePOSCheckout instead
 */

import { useCallback, useState } from 'react';
import { useAppDispatch } from '@/redux/store';
import {
  updateOrderItemsFromPOSService,
  confirmPOSOrderChangesService,
  fetchOrderUpdateHistoryService,
} from '@/redux/features/business/store/thunks/order-admin-thunks';
import {
  UpdateOrderItemsFromPOSRequest,
  ConfirmPOSOrderChangesRequest,
  POSOrderItemUpdate,
} from '@/redux/features/main/store/models/request/order-pos-update-request';
import { showToast } from '@/components/shared/common/show-toast';

interface UsePOSOrderUpdateState {
  isUpdating: boolean;
  isConfirming: boolean;
  isFetchingHistory: boolean;
  error: string | null;
}

export function usePOSOrderUpdate() {
  const dispatch = useAppDispatch();
  const [state, setState] = useState<UsePOSOrderUpdateState>({
    isUpdating: false,
    isConfirming: false,
    isFetchingHistory: false,
    error: null,
  });

  /**
   * Update items on an existing order from POS
   * Supports updating prices, quantities, and promotions
   * For creating NEW orders, use usePOSCheckout instead
   */
  const updateOrderItems = useCallback(
    async (
      orderId: string,
      itemUpdates: POSOrderItemUpdate[],
      options?: {
        reason?: string;
        shouldAutoConfirm?: boolean;
      }
    ) => {
      setState((prev) => ({ ...prev, isUpdating: true, error: null }));

      try {
        if (itemUpdates.length === 0) {
          throw new Error('No items to update');
        }

        const request: UpdateOrderItemsFromPOSRequest = {
          orderId,
          itemUpdates,
          reason: options?.reason,
          shouldAutoConfirm: options?.shouldAutoConfirm ?? false,
        };

        const response = await dispatch(updateOrderItemsFromPOSService(request)).unwrap();

        showToast.success('Order updated successfully');

        if (response.requiresConfirmation) {
          showToast.info('Order awaiting admin confirmation');
        }

        return response;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to update order';
        setState((prev) => ({ ...prev, error: message }));
        showToast.error(message);
        throw error;
      } finally {
        setState((prev) => ({ ...prev, isUpdating: false }));
      }
    },
    [dispatch]
  );

  /**
   * Confirm POS changes made to an order
   * Moves order from PENDING_POS_CONFIRMATION to CONFIRMED (or back to PENDING if rejected)
   */
  const confirmPOSChanges = useCallback(
    async (
      orderId: string,
      confirmed: boolean,
      adminNote?: string
    ) => {
      setState((prev) => ({ ...prev, isConfirming: true, error: null }));

      try {
        const request: ConfirmPOSOrderChangesRequest = {
          orderId,
          confirmed,
          adminNote,
        };

        const response = await dispatch(confirmPOSOrderChangesService(request)).unwrap();

        const message = confirmed
          ? 'Changes confirmed successfully'
          : 'Changes rejected, order returned to pending';

        showToast.success(message);
        return response;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to confirm changes';
        setState((prev) => ({ ...prev, error: message }));
        showToast.error(message);
        throw error;
      } finally {
        setState((prev) => ({ ...prev, isConfirming: false }));
      }
    },
    [dispatch]
  );

  /**
   * Fetch complete update history for an order
   * Shows all modifications made to the order with before/after values
   */
  const fetchUpdateHistory = useCallback(
    async (orderId: string) => {
      setState((prev) => ({ ...prev, isFetchingHistory: true, error: null }));

      try {
        const response = await dispatch(
          fetchOrderUpdateHistoryService(orderId)
        ).unwrap();

        return response;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to fetch update history';
        setState((prev) => ({ ...prev, error: message }));
        showToast.error(message);
        throw error;
      } finally {
        setState((prev) => ({ ...prev, isFetchingHistory: false }));
      }
    },
    [dispatch]
  );

  /**
   * Helper to build an item update from cart item changes
   */
  const buildItemUpdate = (
    itemId: string,
    changes: {
      newPrice?: number;
      newQuantity?: number;
      newPromotionType?: string | null;
      newPromotionValue?: number | null;
    },
    reason?: string
  ): POSOrderItemUpdate => {
    return {
      itemId,
      newPrice: changes.newPrice,
      newQuantity: changes.newQuantity,
      newPromotionType: changes.newPromotionType,
      newPromotionValue: changes.newPromotionValue,
      reason,
    };
  };

  return {
    // State
    isUpdating: state.isUpdating,
    isConfirming: state.isConfirming,
    isFetchingHistory: state.isFetchingHistory,
    error: state.error,
    isLoading: state.isUpdating || state.isConfirming || state.isFetchingHistory,

    // Methods
    updateOrderItems,        // Update items on existing order
    confirmPOSChanges,       // Confirm/reject pending changes
    fetchUpdateHistory,      // Get modification history
    buildItemUpdate,         // Helper to build item updates
  };
}
