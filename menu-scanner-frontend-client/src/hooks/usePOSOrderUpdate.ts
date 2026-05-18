


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
    return;
  }, []);

  return {
    isLoading: state.isLoading,
    error: state.error,
    showDeprecatedWarning,
  };
}
