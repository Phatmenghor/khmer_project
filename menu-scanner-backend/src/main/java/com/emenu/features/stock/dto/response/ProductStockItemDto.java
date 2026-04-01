package com.emenu.features.stock.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for product stock items listing
 * Represents a product or product-size with aggregated stock information
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductStockItemDto {

    private UUID id;
    private String productName;
    private String categoryName;
    private String brandName;
    private String sku;
    private String barcode;
    private String sizeName;  // null for PRODUCT type

    private Long totalStock;

    private String status;  // Product status (ACTIVE, INACTIVE)
    private String stockStatus;  // Stock status (ENABLED, DISABLED)

    private String type;  // PRODUCT or SIZE

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}
