package com.emenu.features.main.controller;

import com.emenu.features.main.dto.response.ProductCustomizationGroupDto;
import com.emenu.features.main.service.ProductCustomizationService;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/product-customizations")
@RequiredArgsConstructor
@Slf4j
public class PublicProductCustomizationController {

    private final ProductCustomizationService customizationService;

    /**
     * Get customization groups for product (public endpoint)
     * Customizations are always shown since they're product-specific add-ons,
     * not a business-wide feature like categories or brands
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ProductCustomizationGroupDto>>> getProductCustomizations(
            @PathVariable UUID productId) {
        long startTime = System.currentTimeMillis();
        log.info("Getting customizations for product (public): {}", productId);

        try {
            List<ProductCustomizationGroupDto> customizations = customizationService.getProductCustomizationGroupsActive(productId);
            long duration = System.currentTimeMillis() - startTime;

            log.info("Retrieved {} active customization groups for product in {}ms", customizations.size(), duration);
            return ResponseEntity.ok(ApiResponse.success(
                "Product customizations retrieved successfully",
                customizations
            ));
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to get product customizations after {}ms - Error: {}", duration, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Get customization group by ID (public endpoint)
     */
    @GetMapping("/groups/{groupId}")
    public ResponseEntity<ApiResponse<ProductCustomizationGroupDto>> getCustomizationGroup(
            @PathVariable UUID groupId) {
        log.info("Getting customization group (public): {}", groupId);

        try {
            ProductCustomizationGroupDto group = customizationService.getCustomizationGroupById(groupId);
            log.info("Customization group retrieved successfully - ID: {}", groupId);
            return ResponseEntity.ok(ApiResponse.success(
                "Customization group retrieved successfully",
                group
            ));
        } catch (Exception e) {
            log.error("Failed to get customization group - Error: {}", e.getMessage(), e);
            throw e;
        }
    }
}
