package com.emenu.features.main.controller;

import com.emenu.features.main.dto.response.ProductCustomizationDto;
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

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ProductCustomizationDto>>> getProductCustomizations(
            @PathVariable UUID productId) {
        long startTime = System.currentTimeMillis();
        log.info("Getting add-ons for product (public): {}", productId);

        try {
            List<ProductCustomizationDto> addOns = customizationService.getProductCustomizationsActive(productId);
            long duration = System.currentTimeMillis() - startTime;

            log.info("Retrieved {} active add-ons for product in {}ms", addOns.size(), duration);
            return ResponseEntity.ok(ApiResponse.success(
                "Product add-ons retrieved successfully",
                addOns
            ));
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to get product add-ons after {}ms - Error: {}", duration, e.getMessage(), e);
            throw e;
        }
    }
}
