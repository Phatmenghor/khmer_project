package com.emenu.features.main.controller;

import com.emenu.features.main.dto.request.ProductCustomizationCreateDto;
import com.emenu.features.main.dto.response.ProductCustomizationDto;
import com.emenu.features.main.service.ProductCustomizationService;
import com.emenu.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/product-customizations")
@RequiredArgsConstructor
@Slf4j
public class ProductCustomizationController {

    private final ProductCustomizationService customizationService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductCustomizationDto>> createCustomization(
            @Valid @RequestBody ProductCustomizationCreateDto request) {
        long startTime = System.currentTimeMillis();
        log.info("Creating add-on - Product: {}, Name: {}", request.getProductId(), request.getName());

        try {
            ProductCustomizationDto addOn = customizationService.createCustomization(request);
            long duration = System.currentTimeMillis() - startTime;

            log.info("Add-on created successfully in {}ms - ID: {}", duration, addOn.getId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Add-on created successfully", addOn));
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to create add-on after {}ms - Error: {}", duration, e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/{customizationId}")
    public ResponseEntity<ApiResponse<ProductCustomizationDto>> getCustomization(
            @PathVariable UUID customizationId) {
        log.info("Fetching add-on: {}", customizationId);

        try {
            ProductCustomizationDto addOn = customizationService.getCustomizationById(customizationId);
            log.info("Add-on retrieved successfully - ID: {}", customizationId);
            return ResponseEntity.ok(ApiResponse.success("Add-on retrieved successfully", addOn));
        } catch (Exception e) {
            log.error("Failed to fetch add-on - Error: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/{customizationId}")
    public ResponseEntity<ApiResponse<ProductCustomizationDto>> updateCustomization(
            @PathVariable UUID customizationId,
            @Valid @RequestBody ProductCustomizationCreateDto request) {
        log.info("Updating add-on: {}", customizationId);

        try {
            ProductCustomizationDto addOn = customizationService.updateCustomization(customizationId, request);
            log.info("Add-on updated successfully - ID: {}", customizationId);
            return ResponseEntity.ok(ApiResponse.success("Add-on updated successfully", addOn));
        } catch (Exception e) {
            log.error("Failed to update add-on - Error: {}", e.getMessage(), e);
            throw e;
        }
    }

    @DeleteMapping("/{customizationId}")
    public ResponseEntity<ApiResponse<Void>> deleteCustomization(
            @PathVariable UUID customizationId) {
        log.info("Deleting add-on: {}", customizationId);

        try {
            customizationService.deleteCustomization(customizationId);
            log.info("Add-on deleted successfully - ID: {}", customizationId);
            return ResponseEntity.ok(ApiResponse.success("Add-on deleted successfully", null));
        } catch (Exception e) {
            log.error("Failed to delete add-on - Error: {}", e.getMessage(), e);
            throw e;
        }
    }
}
