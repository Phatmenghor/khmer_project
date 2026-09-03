package com.emenu.features.order.controller;

import com.emenu.features.order.dto.request.CartItemCreateRequest;
import com.emenu.features.order.dto.response.CartSummaryResponse;
import com.emenu.features.order.service.CartService;
import com.emenu.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping
    public ResponseEntity<ApiResponse<CartSummaryResponse>> submitCartItem(@Valid @RequestBody CartItemCreateRequest request) {
        CartSummaryResponse cart = cartService.submitCartItem(request);
        return ResponseEntity.ok(ApiResponse.success("Cart updated successfully", cart));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<CartSummaryResponse>> getCart(
            @Valid @RequestBody GetCartRequest request) {
        CartSummaryResponse cart = cartService.getCartPaginated(request.getBusinessId(), 1, 1000, request.getSearch());
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cart));
    }

    @Data
    public static class GetCartRequest {
        @jakarta.validation.constraints.NotNull(message = "Business ID is required")
        private UUID businessId;
        private String search;
    }

    @DeleteMapping("/{businessId}/clear")
    public ResponseEntity<ApiResponse<CartSummaryResponse>> clearCart(@PathVariable UUID businessId) {
        CartSummaryResponse cart = cartService.clearCart(businessId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", cart));
    }
}
