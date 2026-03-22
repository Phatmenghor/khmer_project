package com.emenu.features.stock.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductStockUpdateRequest {

    @Min(value = 0, message = "Quantity on hand must be >= 0")
    private Integer quantityOnHand;

    @Min(value = 0, message = "Quantity reserved must be >= 0")
    private Integer quantityReserved;

    @Min(value = 0, message = "Minimum stock level must be >= 0")
    private Integer minimumStockLevel;

    @Min(value = 1, message = "Reorder quantity must be >= 1")
    private Integer reorderQuantity;

    @DecimalMin(value = "0.01", message = "Price in must be > 0")
    private BigDecimal priceIn;

    @DecimalMin(value = "0.01", message = "Price out must be > 0")
    private BigDecimal priceOut;

    private BigDecimal costPerUnit;

    private LocalDate expiryDate;

    private String barcode;

    private String sku;

    private String location;

    private Boolean isActive;

    private Boolean trackInventory;
}
