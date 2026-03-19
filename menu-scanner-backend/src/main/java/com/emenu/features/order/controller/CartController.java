package com.emenu.features.order.controller;

import com.emenu.features.order.dto.request.CartItemCreateRequest;
import com.emenu.features.order.dto.request.CartPaginationRequest;
import com.emenu.features.order.dto.response.CartSummaryResponse;
import com.emenu.features.order.service.CartService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
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
    public ResponseEntity<ApiResponse<PaginationResponse<CartSummaryResponse>>> getCart(
            @Valid @RequestBody CartPaginationRequest request) {
        log.info("Getting cart for business: {}, page: {}, size: {}",
                request.getBusinessId(), request.getPageNo(), request.getPageSize());
        CartSummaryResponse cart = cartService.getCartPaginated(request.getBusinessId(), request.getPageNo(), request.getPageSize());

        // Wrap response with pagination info
        int pageNo = request.getPageNo();
        int pageSize = request.getPageSize();
        int totalItems = cart.getTotalItems() != null ? cart.getTotalItems() : 0;
        int totalPages = (totalItems + pageSize - 1) / pageSize; // Ceiling division

        PaginationResponse<CartSummaryResponse> paginationResponse = PaginationResponse.<CartSummaryResponse>builder()
                .content(Collections.singletonList(cart))
                .pageNo(pageNo)
                .pageSize(pageSize)
                .totalElements(totalItems)
                .totalPages(totalPages)
                .first(pageNo == 1)
                .last(pageNo >= totalPages)
                .hasNext(pageNo < totalPages)
                .hasPrevious(pageNo > 1)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", paginationResponse));
    }

    @DeleteMapping("/{businessId}/clear")
    public ResponseEntity<ApiResponse<CartSummaryResponse>> clearCart(@PathVariable UUID businessId) {
        log.info("Clearing cart for business: {}", businessId);
        CartSummaryResponse cart = cartService.clearCart(businessId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", cart));
    }
}
