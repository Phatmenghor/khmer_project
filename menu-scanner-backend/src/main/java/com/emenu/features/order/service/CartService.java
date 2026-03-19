package com.emenu.features.order.service;

import com.emenu.features.order.dto.request.CartItemCreateRequest;
import com.emenu.features.order.dto.response.CartSummaryResponse;

import java.util.UUID;

public interface CartService {

    /**
     * POST - Submit cart item (add/update/remove)
     * Quantity 0 = remove, quantity >= 1 = set quantity
     */
    CartSummaryResponse submitCartItem(CartItemCreateRequest request);

    /**
     * GET - Get current user's cart for a specific business
     */
    CartSummaryResponse getCart(UUID businessId);

    /**
     * GET - Get paginated cart items for current user
     * Used for infinite scroll / pagination on frontend
     */
    CartSummaryResponse getCartPaginated(UUID businessId, int pageNo, int pageSize);

    /**
     * DELETE - Clear current user's cart for a specific business
     */
    CartSummaryResponse clearCart(UUID businessId);
}
