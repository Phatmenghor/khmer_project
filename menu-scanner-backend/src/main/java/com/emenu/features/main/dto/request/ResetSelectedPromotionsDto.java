package com.emenu.features.main.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for resetting promotions for selected products and/or specific sizes
 *
 * Usage:
 * 1. Reset all promotions for selected products:
 *    { "productIds": [...], "productSizeMapping": null }
 *
 * 2. Reset promotions only for specific sizes:
 *    { "productIds": [...], "productSizeMapping": {"productId1": ["sizeId1", "sizeId2"]} }
 */
@Data
public class ResetSelectedPromotionsDto {

    @NotEmpty(message = "At least one product must be selected")
    private List<UUID> productIds;

    // Optional: Map of productId -> List of sizeIds to reset
    // If provided, only these sizes will have promotions reset
    // If not provided or empty, all promotions for the product will be reset
    private Map<UUID, List<UUID>> productSizeMapping;
}
