package com.emenu.features.stock.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductStockCreateRequest {

    @NotNull(message = "Product ID is required")
    private UUID productId;

    private UUID productSizeId;

    @NotNull(message = "Quantity on hand is required")
    @Min(value = 0, message = "Quantity on hand must be >= 0")
    private Integer quantityOnHand;

    @Min(value = 0, message = "Quantity reserved must be >= 0")
    private Integer quantityReserved;

    @NotNull(message = "Minimum stock level is required")
    @Min(value = 0, message = "Minimum stock level must be >= 0")
    private Integer minimumStockLevel;

    @NotNull(message = "Price in is required")
    @DecimalMin(value = "0.01", message = "Price in must be > 0")
    private BigDecimal priceIn;

    @NotNull(message = "Price out is required")
    @DecimalMin(value = "0.01", message = "Price out must be > 0")
    private BigDecimal priceOut;

    private BigDecimal costPerUnit;

    private LocalDate expiryDate;

    private String barcode;

    private String sku;

    private String location;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Boolean trackInventory = true;
}
