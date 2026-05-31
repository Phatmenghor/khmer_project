package com.emenu.features.order.service;

import com.emenu.features.order.dto.request.CartItemCreateRequest;
import com.emenu.features.order.dto.response.CartSummaryResponse;

import java.util.UUID;

public interface CartService {

    CartSummaryResponse submitCartItem(CartItemCreateRequest request);

    CartSummaryResponse getCart(UUID businessId);

    CartSummaryResponse getCartPaginated(UUID businessId, int pageNo, int pageSize);

    CartSummaryResponse getCartPaginated(UUID businessId, int pageNo, int pageSize, String search);

    CartSummaryResponse clearCart(UUID businessId);
}

