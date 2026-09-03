package com.emenu.features.order.controller;

import com.emenu.features.order.dto.filter.DeliveryOptionFilterRequest;
import com.emenu.features.order.dto.request.DeliveryOptionCreateRequest;
import com.emenu.features.order.dto.response.DeliveryOptionResponse;
import com.emenu.features.order.dto.update.DeliveryOptionUpdateRequest;
import com.emenu.features.order.service.DeliveryOptionService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.BatchImportResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/delivery-options")
@RequiredArgsConstructor
public class DeliveryOptionController {

    private final DeliveryOptionService deliveryOptionService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<ApiResponse<DeliveryOptionResponse>> createDeliveryOption(
            @Valid @RequestBody DeliveryOptionCreateRequest request) {
        DeliveryOptionResponse deliveryOption = deliveryOptionService.createDeliveryOption(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Delivery option created successfully", deliveryOption));
    }

    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<BatchImportResponse<DeliveryOptionResponse>>> createDeliveryOptionBatch(
            @RequestBody List<DeliveryOptionCreateRequest> requests,
            @RequestParam(required = false) String importId) {
        BatchImportResponse<DeliveryOptionResponse> response = deliveryOptionService.createDeliveryOptionBatch(requests, importId);
        return ResponseEntity.ok(ApiResponse.success("Batch delivery option import completed", response));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<DeliveryOptionResponse>>> getAllDeliveryOptions(
            @Valid @RequestBody DeliveryOptionFilterRequest filter) {
        PaginationResponse<DeliveryOptionResponse> deliveryOptions =
                deliveryOptionService.getAllDeliveryOptions(filter);
        return ResponseEntity.ok(ApiResponse.success("Delivery options retrieved successfully", deliveryOptions));
    }

    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<DeliveryOptionResponse>>> getMyBusinessDeliveryOptions(
            @Valid @RequestBody DeliveryOptionFilterRequest filter) {
        if (filter.getBusinessId() == null) {
            UUID businessId = securityUtils.getCurrentUser().getBusinessId();
            filter.setBusinessId(businessId);
        }
        PaginationResponse<DeliveryOptionResponse> deliveryOptions =
                deliveryOptionService.getAllDeliveryOptions(filter);
        return ResponseEntity.ok(ApiResponse.success("Business delivery options retrieved successfully", deliveryOptions));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DeliveryOptionResponse>> getDeliveryOptionById(@PathVariable UUID id) {
        DeliveryOptionResponse deliveryOption = deliveryOptionService.getDeliveryOptionById(id);
        return ResponseEntity.ok(ApiResponse.success("Delivery option retrieved successfully", deliveryOption));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DeliveryOptionResponse>> updateDeliveryOption(
            @PathVariable UUID id,
            @Valid @RequestBody DeliveryOptionUpdateRequest request) {
        DeliveryOptionResponse deliveryOption = deliveryOptionService.updateDeliveryOption(id, request);
        return ResponseEntity.ok(ApiResponse.success("Delivery option updated successfully", deliveryOption));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<DeliveryOptionResponse>> deleteDeliveryOption(@PathVariable UUID id) {
        DeliveryOptionResponse deliveryOption = deliveryOptionService.deleteDeliveryOption(id);
        return ResponseEntity.ok(ApiResponse.success("Delivery option deleted successfully", deliveryOption));
    }
}
