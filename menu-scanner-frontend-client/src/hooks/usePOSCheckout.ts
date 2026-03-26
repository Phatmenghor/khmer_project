/**
 * usePOSCheckout Hook
 * Creates orders from POS with full admin capabilities
 * Use this for creating NEW orders from POS
 * For updating existing orders, use usePOSOrderUpdate instead
 */

import { useCallback, useState } from 'react';
import { useAppDispatch } from '@/redux/store';
import { createPOSCheckoutOrderService } from '@/redux/features/business/store/thunks/pos-page-thunks';
import {
  POSCheckoutRequest,
  POSCheckoutResponse,
  POSCheckoutItemRequest,
  POSCheckoutAddressRequest,
} from '@/redux/features/business/store/models/request/pos-checkout-request';
import { showToast } from '@/components/shared/common/show-toast';

interface UsePOSCheckoutState {
  isCreating: boolean;
  error: string | null;
}

export function usePOSCheckout() {
  const dispatch = useAppDispatch();
  const [state, setState] = useState<UsePOSCheckoutState>({
    isCreating: false,
    error: null,
  });

  /**
   * Create a complete order from POS
   * All order details can be set by admin including:
   * - Custom prices (override product prices)
   * - Promotions for items
   * - Delivery and payment options
   * - Customer info or create for existing customer
   */
  const createPOSOrder = useCallback(
    async (request: POSCheckoutRequest) => {
      setState({ isCreating: true, error: null });

      try {
        if (!request.items || request.items.length === 0) {
          throw new Error('Order must have at least one item');
        }

        const response = await dispatch(
          createPOSCheckoutOrderService(request)
        ).unwrap();

        showToast.success(
          `Order #${response.orderNumber} created successfully from POS`
        );
        return response;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to create POS order';
        setState((prev) => ({ ...prev, error: message }));
        showToast.error(message);
        throw error;
      } finally {
        setState((prev) => ({ ...prev, isCreating: false }));
      }
    },
    [dispatch]
  );

  /**
   * Helper to build a POS checkout request from cart items
   */
  const buildPOSCheckoutRequest = (params: {
    businessId: string;
    items: POSCheckoutItemRequest[];
    deliveryOptionId: string;
    deliveryAddress: POSCheckoutAddressRequest;
    paymentMethodId: string;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    paymentStatus?: string;
    customerNote?: string;
    businessNote?: string;
    adminId?: string;
    autoConfirmStatus?: boolean;
    discountAmount?: number;
    taxAmount?: number;
  }): POSCheckoutRequest => {
    return {
      businessId: params.businessId,
      items: params.items,
      deliveryOptionId: params.deliveryOptionId,
      deliveryAddress: params.deliveryAddress,
      paymentMethodId: params.paymentMethodId,
      customerId: params.customerId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      paymentStatus: (params.paymentStatus as any) || 'PENDING',
      customerNote: params.customerNote,
      businessNote: params.businessNote,
      adminId: params.adminId,
      autoConfirmStatus: params.autoConfirmStatus ?? true,
      discountAmount: params.discountAmount,
      taxAmount: params.taxAmount,
    };
  };

  /**
   * Helper to build a POS checkout item from cart item
   */
  const buildPOSCheckoutItem = (params: {
    productId: string;
    sizeId?: string | null;
    quantity: number;
    overridePrice?: number;
    promotionType?: string | null;
    promotionValue?: number | null;
  }): POSCheckoutItemRequest => {
    return {
      productId: params.productId,
      sizeId: params.sizeId,
      quantity: params.quantity,
      overridePrice: params.overridePrice,
      promotionType: params.promotionType,
      promotionValue: params.promotionValue,
    };
  };

  return {
    // State
    isCreating: state.isCreating,
    error: state.error,

    // Methods
    createPOSOrder,
    buildPOSCheckoutRequest,
    buildPOSCheckoutItem,
  };
}
