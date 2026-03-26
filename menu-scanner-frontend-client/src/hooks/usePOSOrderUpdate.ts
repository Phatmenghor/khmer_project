/**
 * usePOSOrderUpdate Hook - DEPRECATED
 *
 * No longer needed with simplified POS architecture
 * Orders are now complete when created (no update/confirm workflow)
 *
 * For updating order status/payment after creation:
 * Use standard updateOrderAdminService from order-admin-thunks
 *
 * For creating new POS orders:
 * Use usePOSCheckout() instead
 */

import { useCallback, useState } from 'react';

interface UsePOSOrderUpdateState {
  isLoading: boolean;
  error: string | null;
}

export function usePOSOrderUpdate() {
  const [state, setState] = useState<UsePOSOrderUpdateState>({
    isLoading: false,
    error: null,
  });

  const showDeprecatedWarning = useCallback(() => {
    console.warn(
      'usePOSOrderUpdate is deprecated. Use updateOrderAdminService for status updates or usePOSCheckout for creating orders.'
    );
  }, []);

  return {
    isLoading: state.isLoading,
    error: state.error,
    showDeprecatedWarning,
  };
}
