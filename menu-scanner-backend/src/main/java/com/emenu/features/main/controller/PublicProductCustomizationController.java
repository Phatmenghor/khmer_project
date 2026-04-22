package com.emenu.features.main.controller;

import com.emenu.features.main.dto.response.ProductCustomizationGroupDto;
import com.emenu.features.main.service.ProductConditionalService;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/product-customizations")
@RequiredArgsConstructor
@Slf4j
public class PublicProductCustomizationController {

    private final ProductConditionalService productConditionalService;

    /**
     * Get customization groups for product (public endpoint with visibility control)
     * Customizations are always shown since they're product-specific add-ons,
     * not a business-wide feature like categories or brands
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ProductCustomizationGroupDto>>> getProductCustomizations(
            @PathVariable UUID productId) {
        log.info("Getting customizations for product (public): {}", productId);

        // TODO: Implement service layer
        // Customizations are shown based on product visibility, not a separate feature flag
        return ResponseEntity.ok(ApiResponse.success(
            "Product customizations retrieved successfully",
            Collections.emptyList()
        ));
    }

    /**
     * Get customization group by ID (public endpoint)
     */
    @GetMapping("/groups/{groupId}")
    public ResponseEntity<ApiResponse<ProductCustomizationGroupDto>> getCustomizationGroup(
            @PathVariable UUID groupId) {
        log.info("Getting customization group (public): {}", groupId);

        // TODO: Implement service layer
        return ResponseEntity.ok(ApiResponse.success(
            "Customization group retrieved successfully",
            null
        ));
    }
}
