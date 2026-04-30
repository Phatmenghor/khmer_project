package com.emenu.features.order.controller;

import com.emenu.features.order.service.OrderTestDataGeneratorService;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Admin-only controller for generating test data
 * Only available in development/test environments
 */
@RestController
@RequestMapping("/api/v1/test-data/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderTestDataController {

    private final OrderTestDataGeneratorService testDataGenerator;

    /**
     * Generate test orders with comprehensive data
     * Features:
     * - 50% CUSTOMER orders, 50% BUSINESS (POS) orders
     * - Full customer information (no null fields)
     * - Delivery address with coordinates
     * - 7-10 status history entries per order
     * - 5-15 items per order with promotion details
     * - Varied pricing with discounts and add-ons
     *
     * @param count Number of test orders to generate (default: 10, max: 100)
     * @return API response with generation results
     */
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateTestOrders(
            @RequestParam(name = "count", defaultValue = "10") int count) {

        log.info("📋 [TEST DATA] Generating {} test orders", count);

        // Limit to prevent overwhelming the database
        if (count > 100) {
            count = 100;
            log.warn("Request count exceeded max (100). Using 100 instead.");
        }
        if (count < 1) {
            count = 1;
            log.warn("Request count invalid. Using minimum (1).");
        }

        try {
            int generated = testDataGenerator.generateTestOrderData(count);

            Map<String, Object> result = new HashMap<>();
            result.put("requestedCount", count);
            result.put("generatedCount", generated);
            result.put("success", generated > 0);
            result.put("features", new String[]{
                    "50% Customer Orders",
                    "50% POS Orders",
                    "Full customer information",
                    "Delivery addresses with GPS coordinates",
                    "7-10 status history entries per order",
                    "5-15 items per order",
                    "Promotion details and discounts",
                    "Add-ons and customizations",
                    "Complete pricing breakdown"
            });

            log.info("✅ [TEST DATA] Generated {} orders successfully", generated);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Test data generated successfully", result));

        } catch (Exception e) {
            log.error("❌ [TEST DATA] Error generating test data: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("requestedCount", count);
            error.put("generatedCount", 0);
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate test data", error));
        }
    }

    /**
     * Health check endpoint to verify test data service is available
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> healthCheck() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "available");
        health.put("endpoint", "/api/v1/test-data/orders/generate");
        health.put("maxCount", "100");
        health.put("environment", "development/test");
        return ResponseEntity.ok(ApiResponse.success("Test data service is healthy", health));
    }
}
