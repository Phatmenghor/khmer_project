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
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;
    private final SecurityUtils securityUtils;

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrderFromCart(@Valid @RequestBody OrderCreateRequest request) {
        log.info("Endpoint: checkout - order checkout: business_id={}", request.getBusinessId());
        OrderResponse order = orderService.createOrderFromCart(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created successfully", order));
    }

    @PostMapping("/guest-lookup")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getGuestOrders(@RequestBody List<UUID> orderIds) {
        log.info("Endpoint: guest-lookup - retrieving {} guest orders", orderIds != null ? orderIds.size() : 0);
        List<OrderResponse> orders = orderService.getGuestOrders(orderIds);
        return ResponseEntity.ok(ApiResponse.success("Guest orders retrieved successfully", orders));
    }

    @PostMapping("/checkout-from-pos")
    public ResponseEntity<ApiResponse<OrderResponse>> createPOSCheckoutOrder(@Valid @RequestBody POSCheckoutRequest request) {
        log.info("Endpoint: checkout-pos - pos order checkout: business_id={}", request.getBusinessId());
        OrderResponse order = orderService.createPOSCheckoutOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("POS order created successfully", order));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<OrderResponse>>> getAllOrders(@Valid @RequestBody OrderFilterRequest filter) {
        log.info("Endpoint: search-orders - orders retrieval: page={}, size={}", filter.getPageNo(), filter.getPageSize());
        PaginationResponse<OrderResponse> orders = orderService.getAllOrders(filter);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }

    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<OrderResponse>>> getMyBusinessOrders(@Valid @RequestBody OrderFilterRequest filter) {
        log.info("Endpoint: my-business-orders - business orders retrieval: page={}, size={}", filter.getPageNo(), filter.getPageSize());
        User currentUser = securityUtils.getCurrentUser();
        filter.setBusinessId(currentUser.getBusinessId());
        PaginationResponse<OrderResponse> orders = orderService.getAllOrders(filter);
        return ResponseEntity.ok(ApiResponse.success("Business orders retrieved successfully", orders));
    }

    @PostMapping("/my-orders")
    public ResponseEntity<ApiResponse<PaginationResponse<OrderResponse>>> getMyOrders(@Valid @RequestBody OrderFilterRequest filter) {
        log.info("Endpoint: my-orders - my orders retrieval: page={}, size={}", filter.getPageNo(), filter.getPageSize());
        PaginationResponse<OrderResponse> orders = orderService.getCustomerOrderHistory(filter);
        return ResponseEntity.ok(ApiResponse.success("Order history retrieved successfully", orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable String id) {
        log.info("Endpoint: get-order - order retrieval: idOrNumber={}", id);
        OrderResponse order = orderService.getOrderByIdOrNumber(id);
        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrder(
            @PathVariable UUID id,
            @Valid @RequestBody OrderUpdateRequest request) {
        log.info("Endpoint: update-order - order update: id={}", id);
        OrderResponse order = orderService.updateOrder(id, request);
        return ResponseEntity.ok(ApiResponse.success("Order updated successfully", order));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable UUID id) {
        log.info("Endpoint: cancel-order - order cancellation: id={}", id);
        OrderResponse order = orderService.cancelOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", order));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> deleteOrder(@PathVariable UUID id) {
        log.info("Endpoint: delete-order - order deletion: id={}", id);
        OrderResponse orderResponse = orderService.deleteOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order deleted successfully", orderResponse));
    }

    @GetMapping("/{id}/receipt/pdf")
    public ResponseEntity<byte[]> getOrderReceiptPdf(@PathVariable UUID id) {
        log.info("Endpoint: get-receipt-pdf - order receipt pdf retrieval: id={}", id);
        byte[] pdfBytes = orderService.getOrderReceiptPdf(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "receipt-" + id + ".pdf");
        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}
