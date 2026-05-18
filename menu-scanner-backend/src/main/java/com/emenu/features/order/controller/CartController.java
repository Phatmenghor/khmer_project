package com.emenu.features.order.controller;

import com.emenu.features.order.dto.request.CartItemCreateRequest;
import com.emenu.features.order.dto.response.CartSummaryResponse;
import com.emenu.features.order.service.CartService;
import com.emenu.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Slf4j
public class CartController {

    private final CartService cartService;

    @PostMapping
    public ResponseEntity<ApiResponse<CartSummaryResponse>> submitCartItem(@Valid @RequestBody CartItemCreateRequest request) {
        log.info("Endpoint: submit-cart-item - cart item submission: product_id={}, qty={}", request.getProductId(), request.getQuantity());
        CartSummaryResponse cart = cartService.submitCartItem(request);
        return ResponseEntity.ok(ApiResponse.success("Cart updated successfully", cart));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<CartSummaryResponse>> getCart(
            @Valid @RequestBody GetCartRequest request) {
        log.info("Endpoint: get-cart - full cart retrieval: business_id={}", request.getBusinessId());
        CartSummaryResponse cart = cartService.getCartPaginated(request.getBusinessId(), 1, 1000);
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cart));
    }

    @Data
    public static class GetCartRequest {
        @jakarta.validation.constraints.NotNull(message = "Business ID is required")
        private UUID businessId;
    }

    @DeleteMapping("/{businessId}/clear")
    public ResponseEntity<ApiResponse<CartSummaryResponse>> clearCart(@PathVariable UUID businessId) {
        log.info("Endpoint: clear-cart - cart clearing: business_id={}", businessId);
        CartSummaryResponse cart = cartService.clearCart(businessId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", cart));
    }
}
