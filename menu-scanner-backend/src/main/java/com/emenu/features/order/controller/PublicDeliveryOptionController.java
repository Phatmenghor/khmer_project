package com.emenu.features.order.controller;

import com.emenu.features.order.dto.filter.DeliveryOptionAllFilterRequest;
import com.emenu.features.order.dto.filter.DeliveryOptionFilterRequest;
import com.emenu.features.order.dto.response.DeliveryOptionResponse;
import com.emenu.features.order.service.DeliveryOptionService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/delivery-options")
@RequiredArgsConstructor
@Slf4j
public class PublicDeliveryOptionController {

    private final DeliveryOptionService deliveryOptionService;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<DeliveryOptionResponse>>> getDeliveryOptions(
            @Valid @RequestBody DeliveryOptionFilterRequest filter) {
        log.info("Endpoint: public-search-delivery-options - public delivery options retrieval: page={}, size={}", filter.getPageNo(), filter.getPageSize());
        PaginationResponse<DeliveryOptionResponse> deliveryOptions = deliveryOptionService.getAllDeliveryOptions(filter);
        return ResponseEntity.ok(ApiResponse.success("Business all delivery options retrieved successfully", deliveryOptions));
    }

    @PostMapping("/all-data")
    public ResponseEntity<ApiResponse<List<DeliveryOptionResponse>>> getAllDeliveryOptions(
            @Valid @RequestBody DeliveryOptionAllFilterRequest filter) {
        log.info("Endpoint: public-list-delivery-options - public delivery options list retrieval: business_id={}", filter.getBusinessId());
        List<DeliveryOptionResponse> deliveryOptions = deliveryOptionService.getAllItemDeliveryOptions(filter);
        return ResponseEntity.ok(ApiResponse.success("Business all delivery options retrieved successfully", deliveryOptions));
    }
}
