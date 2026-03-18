/**
 * Cart debugging helper with ## markers for easy console searching
 * Usage: Just import this file and use the helper functions
 * Search in console: Ctrl+F → "##" to find all markers
 */

export const CartDebugHelper = {
  /**
   * Log when addToCart request is being sent
   */
  logAddToCartRequest: (data: {
    productId: string;
    productSizeId: string | null;
    quantity: number;
    optimisticTimestamp?: number;
  }) => {
    console.log(
      "%c## [CART-DEBUG] ADD TO CART REQUEST SENT",
      "background: #007bff; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold"
    );
    console.table({
      "Product ID": data.productId,
      "Size ID": data.productSizeId || "none",
      Quantity: data.quantity,
      Timestamp: data.optimisticTimestamp,
      "Endpoint": "POST /api/v1/cart",
    });
  },

  /**
   * Log when API response is received
   */
  logAddToCartResponse: (response: any) => {
    const isCartResponse = response?.items && Array.isArray(response.items);
    const bgColor = isCartResponse ? "#28a745" : "#dc3545";
    const status = isCartResponse ? "✅ CORRECT" : "❌ WRONG";

    console.log(
      `%c## [CART-DEBUG] API RESPONSE RECEIVED ${status}`,
      `background: ${bgColor}; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold`
    );

    if (isCartResponse) {
      console.log("✅ Response has correct CART structure:");
      console.table({
        "Items count": response.items?.length || 0,
        "Total items": response.totalItems,
        Subtotal: response.subtotal,
        "Total discount": response.totalDiscount,
        "Final total": response.finalTotal,
      });
      console.log("Cart items:", response.items);
    } else {
      console.log("❌ Response has WRONG structure (looks like Product response):");
      console.table({
        "Has items[]": !!response?.items,
        "Has totalItems": !!response?.totalItems,
        "Has subtotal": !!response?.subtotal,
        "Has finalTotal": !!response?.finalTotal,
        "Has name": !!response?.name,
        "Has quantity (single)": !!response?.quantity,
      });
      console.log("Response structure:", response);
    }
  },

  /**
   * Log optimistic Redux update
   */
  logOptimisticUpdate: (data: {
    productId: string;
    quantity: number;
    timestamp?: number;
  }) => {
    console.log(
      "%c## [CART-DEBUG] OPTIMISTIC UPDATE TO REDUX",
      "background: #17a2b8; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold"
    );
    console.table({
      "Product ID": data.productId,
      "New quantity": data.quantity,
      Timestamp: data.timestamp,
      Action: "addLocalCartItem or updateLocalCartItem",
    });
  },

  /**
   * Log error
   */
  logError: (error: any, context: string) => {
    console.log(
      "%c## [CART-DEBUG] ❌ ERROR",
      "background: #dc3545; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold"
    );
    console.log(`Context: ${context}`);
    console.error("Error object:", error);
    if (error?.response) {
      console.table({
        "HTTP Status": error.response?.status,
        "Status Text": error.response?.statusText,
        "Message": error.message,
      });
      console.log("Response data:", error.response?.data);
    }
  },

  /**
   * Log network request details
   */
  logNetworkRequest: (config: any) => {
    console.log(
      "%c## [CART-DEBUG] NETWORK REQUEST",
      "background: #6f42c1; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold"
    );
    console.table({
      Method: config.method?.toUpperCase() || "unknown",
      URL: config.url || "unknown",
      "Has data": !!config.data,
      "Data size": config.data ? JSON.stringify(config.data).length : 0,
    });
    if (config.data) {
      console.log("Request payload:", config.data);
    }
  },

  /**
   * Log Redux state change
   */
  logReduxState: (state: any, label: string) => {
    console.log(
      `%c## [CART-DEBUG] REDUX STATE UPDATE - ${label}`,
      "background: #ffc107; color: black; padding: 4px 8px; border-radius: 3px; font-weight: bold"
    );
    console.table({
      "Items count": state.items?.length || 0,
      "Total items": state.totalItems,
      "Final total": state.finalTotal,
      "Is loading": Object.values(state.loading).includes(true),
      "Has error": !!state.error,
    });
    if (state.items?.length > 0) {
      console.log("Cart items:", state.items);
    }
  },

  /**
   * Log conflict resolution
   */
  logConflictResolution: (result: {
    localTimestamp: number;
    serverTimestamp: number;
    winnter: "local" | "server";
    reason: string;
  }) => {
    const color = result.winnter === "local" ? "#28a745" : "#ff6b6b";
    console.log(
      `%c## [CART-DEBUG] CONFLICT RESOLUTION - ${result.winnter.toUpperCase()} WINS`,
      `background: ${color}; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold`
    );
    console.table({
      "Local timestamp": result.localTimestamp,
      "Server timestamp": result.serverTimestamp,
      Winner: result.winnter,
      Reason: result.reason,
    });
  },

  /**
   * Create a checkpoint - useful for tracing flow
   */
  checkpoint: (name: string) => {
    console.log(
      `%c## [CART-DEBUG] ➡️  CHECKPOINT: ${name}`,
      "background: #495057; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold"
    );
  },

  /**
   * Log debounce activity
   */
  logDebounce: (action: "start" | "reset" | "fire" | "queue", data: any) => {
    const colors: Record<string, string> = {
      start: "#007bff",
      reset: "#ff9800",
      fire: "#28a745",
      queue: "#17a2b8",
    };
    console.log(
      `%c## [CART-DEBUG] DEBOUNCE: ${action.toUpperCase()}`,
      `background: ${colors[action]}; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold`
    );
    console.log(`Key: ${data.key}`);
    console.log(`Quantity: ${data.quantity}`);
    if (data.reason) console.log(`Reason: ${data.reason}`);
  },
};

/**
 * Example usage in your code:
 *
 * // In product-card.tsx
 * import { CartDebugHelper } from '@/utils/cart-debug-helper';
 *
 * const handleAddToCart = () => {
 *   CartDebugHelper.checkpoint('handleAddToCart called');
 *   CartDebugHelper.logOptimisticUpdate({ productId, quantity: 1 });
 *   cartDispatch(addLocalCartItem(...));
 *   debouncedUpdate(key, productId, null, 1, timestamp);
 * };
 *
 * // In thunk
 * CartDebugHelper.logAddToCartRequest(data);
 * const response = await api.post('/api/v1/cart', data);
 * CartDebugHelper.logAddToCartResponse(response.data.data);
 *
 * // In error handler
 * CartDebugHelper.logError(error, 'addToCart thunk');
 *
 * // In Redux slice
 * CartDebugHelper.logConflictResolution({
 *   localTimestamp: item.lastOptimisticTimestamp,
 *   serverTimestamp: Date.now(),
 *   winnter: 'local',
 *   reason: 'Local update is newer'
 * });
 */
