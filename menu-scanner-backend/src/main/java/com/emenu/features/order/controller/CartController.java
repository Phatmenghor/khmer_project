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
        log.info("Submit cart item - product: {}, qty: {} (0=remove, >0=add/update)", request.getProductId(), request.getQuantity());
        CartSummaryResponse cart = cartService.submitCartItem(request);
        return ResponseEntity.ok(ApiResponse.success("Cart updated successfully", cart));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<CartSummaryResponse>> getCart(
            @Valid @RequestBody GetCartRequest request) {
        log.info("Getting full cart for business: {}", request.getBusinessId());
        // Get all cart items without pagination - return complete cart data
        CartSummaryResponse cart = cartService.getCartPaginated(request.getBusinessId(), 1, 1000);
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cart));
    }

    // Simple request class for getting full cart (no pagination)
    @Data
    public static class GetCartRequest {
        @jakarta.validation.constraints.NotNull(message = "Business ID is required")
        private UUID businessId;
    }

    @DeleteMapping("/{businessId}/clear")
    public ResponseEntity<ApiResponse<CartSummaryResponse>> clearCart(@PathVariable UUID businessId) {
        log.info("Clearing cart for business: {}", businessId);
        CartSummaryResponse cart = cartService.clearCart(businessId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", cart));
    }
}
