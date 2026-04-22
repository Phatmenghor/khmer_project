package com.emenu.features.main.controller;

import com.emenu.features.main.dto.request.ProductCustomizationCreateDto;
import com.emenu.features.main.dto.request.ProductCustomizationGroupCreateDto;
import com.emenu.features.main.dto.response.ProductCustomizationDto;
import com.emenu.features.main.dto.response.ProductCustomizationGroupDto;
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

    /**
     * Create customization group for product
     */
    @PostMapping("/groups")
    public ResponseEntity<ApiResponse<ProductCustomizationGroupDto>> createCustomizationGroup(
            @Valid @RequestBody ProductCustomizationGroupCreateDto request) {
        long startTime = System.currentTimeMillis();
        log.info("Creating product customization group - Product: {}, Name: {}",
            request.getProductId(), request.getName());

        try {
            ProductCustomizationGroupDto group = customizationService.createCustomizationGroup(request);
            long duration = System.currentTimeMillis() - startTime;

            log.info("Customization group created successfully in {}ms - ID: {}", duration, group.getId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Customization group created successfully", group));
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to create customization group after {}ms - Error: {}", duration, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Get customization groups for product
     */
    @GetMapping("/groups/product/{productId}")
    public ResponseEntity<ApiResponse<List<ProductCustomizationGroupDto>>> getProductCustomizationGroups(
            @PathVariable UUID productId) {
        long startTime = System.currentTimeMillis();
        log.info("Getting customization groups for product: {}", productId);

        try {
            List<ProductCustomizationGroupDto> groups = customizationService.getProductCustomizationGroups(productId);
            long duration = System.currentTimeMillis() - startTime;

            log.info("Retrieved {} customization groups in {}ms", groups.size(), duration);
            return ResponseEntity.ok(ApiResponse.success("Customization groups retrieved successfully", groups));
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to get customization groups after {}ms - Error: {}", duration, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Get customization group by ID
     */
    @GetMapping("/groups/{groupId}")
    public ResponseEntity<ApiResponse<ProductCustomizationGroupDto>> getCustomizationGroup(
            @PathVariable UUID groupId) {
        log.info("Getting customization group: {}", groupId);

        try {
            ProductCustomizationGroupDto group = customizationService.getCustomizationGroupById(groupId);
            log.info("Customization group retrieved successfully - ID: {}", groupId);
            return ResponseEntity.ok(ApiResponse.success("Customization group retrieved successfully", group));
        } catch (Exception e) {
            log.error("Failed to get customization group - Error: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Update customization group
     */
    @PutMapping("/groups/{groupId}")
    public ResponseEntity<ApiResponse<ProductCustomizationGroupDto>> updateCustomizationGroup(
            @PathVariable UUID groupId,
            @Valid @RequestBody ProductCustomizationGroupCreateDto request) {
        long startTime = System.currentTimeMillis();
        log.info("Updating customization group: {}", groupId);

        try {
            ProductCustomizationGroupDto group = customizationService.updateCustomizationGroup(groupId, request);
            long duration = System.currentTimeMillis() - startTime;

            log.info("Customization group updated successfully in {}ms - ID: {}", duration, groupId);
            return ResponseEntity.ok(ApiResponse.success("Customization group updated successfully", group));
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to update customization group after {}ms - Error: {}", duration, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Delete customization group
     */
    @DeleteMapping("/groups/{groupId}")
    public ResponseEntity<ApiResponse<Void>> deleteCustomizationGroup(
            @PathVariable UUID groupId) {
        log.info("Deleting customization group: {}", groupId);

        try {
            customizationService.deleteCustomizationGroup(groupId);
            log.info("Customization group deleted successfully - ID: {}", groupId);
            return ResponseEntity.ok(ApiResponse.success("Customization group deleted successfully", null));
        } catch (Exception e) {
            log.error("Failed to delete customization group - Error: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Create customization option
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ProductCustomizationDto>> createCustomization(
            @Valid @RequestBody ProductCustomizationCreateDto request) {
        long startTime = System.currentTimeMillis();
        log.info("Creating product customization - Group: {}, Name: {}, PriceAdjustment: {}",
            request.getProductCustomizationGroupId(), request.getName(), request.getPriceAdjustment());

        try {
            ProductCustomizationDto customization = customizationService.createCustomization(request);
            long duration = System.currentTimeMillis() - startTime;

            log.info("Customization created successfully in {}ms - ID: {}", duration, customization.getId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Customization created successfully", customization));
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to create customization after {}ms - Error: {}", duration, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Get customization by ID
     */
    @GetMapping("/{customizationId}")
    public ResponseEntity<ApiResponse<ProductCustomizationDto>> getCustomization(
            @PathVariable UUID customizationId) {
        log.info("Getting customization: {}", customizationId);

        try {
            ProductCustomizationDto customization = customizationService.getCustomizationById(customizationId);
            log.info("Customization retrieved successfully - ID: {}", customizationId);
            return ResponseEntity.ok(ApiResponse.success("Customization retrieved successfully", customization));
        } catch (Exception e) {
            log.error("Failed to get customization - Error: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Update customization
     */
    @PutMapping("/{customizationId}")
    public ResponseEntity<ApiResponse<ProductCustomizationDto>> updateCustomization(
            @PathVariable UUID customizationId,
            @Valid @RequestBody ProductCustomizationCreateDto request) {
        long startTime = System.currentTimeMillis();
        log.info("Updating customization: {} - PriceAdjustment: {}",
            customizationId, request.getPriceAdjustment());

        try {
            ProductCustomizationDto customization = customizationService.updateCustomization(customizationId, request);
            long duration = System.currentTimeMillis() - startTime;

            log.info("Customization updated successfully in {}ms - ID: {}", duration, customizationId);
            return ResponseEntity.ok(ApiResponse.success("Customization updated successfully", customization));
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to update customization after {}ms - Error: {}", duration, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Delete customization
     */
    @DeleteMapping("/{customizationId}")
    public ResponseEntity<ApiResponse<Void>> deleteCustomization(
            @PathVariable UUID customizationId) {
        log.info("Deleting customization: {}", customizationId);

        try {
            customizationService.deleteCustomization(customizationId);
            log.info("Customization deleted successfully - ID: {}", customizationId);
            return ResponseEntity.ok(ApiResponse.success("Customization deleted successfully", null));
        } catch (Exception e) {
            log.error("Failed to delete customization - Error: {}", e.getMessage(), e);
            throw e;
        }
    }
}
