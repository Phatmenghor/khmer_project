package com.emenu.features.order.dto.response;

import jakarta.validation.Valid;
import lombok.Data;

import java.util.UUID;

@Data
public class OrderItemResponse {
    private UUID id;

    // Product info grouped for easy identification
    private OrderItemProductInfo product;

    // ===== AUDIT TRAIL: Before/After snapshots =====
    // Snapshot BEFORE any POS modifications (original product price)
    @Valid
    private OrderItemPricingSnapshot before;

    // Was the item modified from POS? (price override, promotion change, quantity change, etc.)
    private Boolean hadChangeFromPOS;

    // Snapshot AFTER POS modifications
    @Valid
    private OrderItemPricingSnapshot after;

    // Reason for the change (if any)
    private String reason;

    @Data
    public static class OrderItemProductInfo {
        private UUID id;
        private String name;
        private String imageUrl;
        private String sku;
        private String barcode;
        private UUID sizeId;
        private String sizeName;
        private String status;
    }
}
