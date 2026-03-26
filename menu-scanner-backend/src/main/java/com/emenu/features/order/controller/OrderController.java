package com.emenu.features.order.controller;

import com.emenu.features.auth.models.User;
import com.emenu.features.order.dto.filter.OrderFilterRequest;
import com.emenu.features.order.dto.request.OrderCreateRequest;
import com.emenu.features.order.dto.request.POSCheckoutRequest;
import com.emenu.features.order.dto.response.OrderResponse;
import com.emenu.features.order.dto.response.POSCheckoutResponse;
import com.emenu.features.order.dto.update.OrderUpdateRequest;
import com.emenu.features.order.service.OrderService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;
    private final SecurityUtils securityUtils;

    /**
     * Create order from cart (checkout) - Requires login
     */
    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrderFromCart(@Valid @RequestBody OrderCreateRequest request) {
        long startTime = System.currentTimeMillis();
        log.info("🛒 [API REQUEST] POST /api/v1/orders/checkout | Business: {}", request.getBusinessId());
        log.debug("📋 [REQUEST DETAILS] Items in cart, OrderStatus: {}", request.getOrderStatus());

        OrderResponse order = orderService.createOrderFromCart(request);

        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ [ORDER CREATED] Order #{} in {} ms | Total: {}",
                order.getOrderNumber(), duration, order.getPricing().getAfter().getFinalTotal());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created successfully", order));
    }

    /**
     * Create POS order directly (Admin/Staff only) - Order is created with COMPLETED status
     * Allows admin to create orders with full control over items, prices, and promotions
     */
    @PostMapping("/checkout-from-pos")
    public ResponseEntity<ApiResponse<POSCheckoutResponse>> createPOSCheckoutOrder(@Valid @RequestBody POSCheckoutRequest request) {
        long startTime = System.currentTimeMillis();
        log.info("🎯 [API REQUEST] POST /api/v1/orders/checkout-from-pos | Business: {}, Items: {}",
                request.getBusinessId(), request.getCart().getItems().size());
        log.debug("📋 [REQUEST DETAILS] Customer: {}, PaymentMethod: {}, Items: {}",
                request.getCustomerId(), request.getPayment().getPaymentMethod(), request.getCart().getItems().size());

        POSCheckoutResponse order = orderService.createPOSCheckoutOrder(request);

        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ [POS ORDER CREATED] Order #{} in {} ms | Total: {} | Status: {}",
                order.getOrderNumber(), duration, order.getTotalAmount(), order.getOrderStatus());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("POS order created successfully", order));
    }

    /**
     * Get all orders with filtering (Admin/Business view)
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<OrderResponse>>> getAllOrders(@Valid @RequestBody OrderFilterRequest filter) {
        long startTime = System.currentTimeMillis();
        log.info("🌐 [API REQUEST] GET /api/v1/orders/all | Page: {}, Size: {}",
                filter.getPageNo(), filter.getPageSize());
        log.debug("📋 [FILTER DETAILS] Business: {}, Status: {}, PaymentMethod: {}, PaymentStatus: {}",
                filter.getBusinessId(), filter.getOrderStatus(), filter.getPaymentMethod(), filter.getPaymentStatus());

        PaginationResponse<OrderResponse> orders = orderService.getAllOrders(filter);

        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ [API RESPONSE] Retrieved {} orders (total: {}) in {} ms | Response size: {} bytes",
                orders.getContent().size(), orders.getTotalElements(), duration,
                orders.getContent().isEmpty() ? 0 : orders.getContent().size() * 500); // Rough estimate

        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }

    /**
     * Get my business orders (for business owners)
     */
    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<OrderResponse>>> getMyBusinessOrders(@Valid @RequestBody OrderFilterRequest filter) {
        long startTime = System.currentTimeMillis();
        User currentUser = securityUtils.getCurrentUser();
        log.info("🏢 [API REQUEST] GET /api/v1/orders/my-business/all | Business: {}, Page: {}, Size: {}",
                currentUser.getBusinessId(), filter.getPageNo(), filter.getPageSize());

        filter.setBusinessId(currentUser.getBusinessId());
        log.debug("📋 [FILTER DETAILS] Status: {}, PaymentMethod: {}, PaymentStatus: {}",
                filter.getOrderStatus(), filter.getPaymentMethod(), filter.getPaymentStatus());

        PaginationResponse<OrderResponse> orders = orderService.getAllOrders(filter);

        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ [API RESPONSE] Retrieved {} business orders (total: {}) in {} ms",
                orders.getContent().size(), orders.getTotalElements(), duration);

        return ResponseEntity.ok(ApiResponse.success("Business orders retrieved successfully", orders));
    }

    /**
     * Get customer order history with pagination (requires login)
     * POST method allows filtering and pagination
     */
    @PostMapping("/my-orders")
    public ResponseEntity<ApiResponse<PaginationResponse<OrderResponse>>> getMyOrders(@Valid @RequestBody OrderFilterRequest filter) {
        long startTime = System.currentTimeMillis();
        User currentUser = securityUtils.getCurrentUser();
        log.info("👤 [API REQUEST] GET /api/v1/orders/my-orders | Customer: {}, Page: {}, Size: {}",
                currentUser.getId(), filter.getPageNo(), filter.getPageSize());

        PaginationResponse<OrderResponse> orders = orderService.getCustomerOrderHistory(filter);

        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ [API RESPONSE] Retrieved {} customer orders (total: {}) in {} ms",
                orders.getContent().size(), orders.getTotalElements(), duration);

        return ResponseEntity.ok(ApiResponse.success("Order history retrieved successfully", orders));
    }

    /**
     * Get order by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable UUID id) {
        long startTime = System.currentTimeMillis();
        log.info("🔍 [API REQUEST] GET /api/v1/orders/{} | Order ID: {}", id, id);

        OrderResponse order = orderService.getOrderById(id);

        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ [ORDER RETRIEVED] Order #{} in {} ms | Status: {} | Total: {}",
                order.getOrderNumber(), duration, order.getOrderStatus(), order.getPricing().getAfter() != null ? order.getPricing().getAfter().getFinalTotal() : order.getPricing().getBefore().getFinalTotal());

        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
    }

    /**
     * Update order (business only) - update status, delivery, payment, notes
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrder(
            @PathVariable UUID id,
            @Valid @RequestBody OrderUpdateRequest request) {
        long startTime = System.currentTimeMillis();
        log.info("✏️ [API REQUEST] PUT /api/v1/orders/{} | Order ID: {}", id, id);
        log.debug("📋 [UPDATE DETAILS] Status: {}, PaymentStatus: {}, HasDeliveryAddress: {}, BusinessNote: {}",
                request.getOrderStatus(), request.getPaymentStatus(), request.getDeliveryAddress() != null, request.getBusinessNote() != null);

        OrderResponse order = orderService.updateOrder(id, request);

        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ [ORDER UPDATED] Order #{} in {} ms | NewStatus: {} | Total: {}",
                order.getOrderNumber(), duration, order.getOrderStatus(), order.getPricing().getAfter() != null ? order.getPricing().getAfter().getFinalTotal() : order.getPricing().getBefore().getFinalTotal());

        return ResponseEntity.ok(ApiResponse.success("Order updated successfully", order));
    }

    /**
     * Delete order (business only)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> deleteOrder(@PathVariable UUID id) {
        long startTime = System.currentTimeMillis();
        log.info("🗑️ [API REQUEST] DELETE /api/v1/orders/{} | Order ID: {}", id, id);

        OrderResponse orderResponse = orderService.deleteOrder(id);

        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ [ORDER DELETED] Order #{} in {} ms | Status: {}",
                orderResponse.getOrderNumber(), duration, orderResponse.getOrderStatus());

        return ResponseEntity.ok(ApiResponse.success("Order deleted successfully", orderResponse));
    }
}
