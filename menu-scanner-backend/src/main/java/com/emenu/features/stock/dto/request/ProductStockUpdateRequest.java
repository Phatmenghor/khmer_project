package com.emenu.features.stock.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

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

    @DecimalMin(value = "0.01", message = "Price in must be > 0")
    private BigDecimal priceIn;

    @DecimalMin(value = "0.01", message = "Price out must be > 0")
    private BigDecimal priceOut;

    private BigDecimal costPerUnit;

    private LocalDateTime expiryDate;

    private String barcode;

    private String sku;

    private String location;
}
