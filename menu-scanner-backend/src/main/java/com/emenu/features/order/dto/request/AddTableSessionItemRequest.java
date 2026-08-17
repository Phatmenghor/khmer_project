package com.emenu.features.order.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddTableSessionItemRequest {

    private UUID businessId;

    private String tableId;

    private String tableNumber;

    private Integer orderRound;

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotNull(message = "Product name is required")
    private String productName;

    private String imageUrl;

    private UUID sizeId;

    private String sizeName;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Unit price is required")
    private BigDecimal unitPrice;

    private BigDecimal customizationTotal;

    private String customerNote;

    @Valid
    private List<CustomizationDetail> customizations;

    public UUID parseTableId() {
        if (tableId == null || tableId.isBlank()) {
            return UUID.fromString("00000000-0000-0000-0000-000000000001");
        }
        try {
            return UUID.fromString(tableId.trim());
        } catch (IllegalArgumentException e) {
            return UUID.nameUUIDFromBytes(("TABLE-" + tableId.trim().toUpperCase()).getBytes(StandardCharsets.UTF_8));
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomizationDetail {
        private UUID productCustomizationId;
        private String name;
        private BigDecimal priceAdjustment;
    }
}
