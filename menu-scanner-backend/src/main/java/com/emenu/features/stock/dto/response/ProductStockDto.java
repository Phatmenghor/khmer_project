package com.emenu.features.stock.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import com.emenu.enums.product.ProductStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductStockDto {

    // ========== Identity ==========

    private UUID id;

    private UUID businessId;

    private UUID productId;

    private UUID productSizeId;

    // ========== Product Info ==========

    private String productName;

    private String sizeName;

    // ========== Stock Quantities ==========

    private Integer quantityOnHand;

    private Integer quantityReserved;

    private Integer quantityAvailable;

    // ========== Pricing ==========

    private BigDecimal priceIn;

    // ========== Dates ==========

    private LocalDateTime dateIn;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expiryDate;

    private String location;

    // ========== Status ==========

    private ProductStatus status;

    private Boolean isExpired;

    private Boolean isOutOfStock;

    // ========== Financial Summary ==========

    private BigDecimal inventoryValue;

    // ========== Audit ==========

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

