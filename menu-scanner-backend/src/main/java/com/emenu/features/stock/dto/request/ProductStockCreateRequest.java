package com.emenu.features.stock.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductStockCreateRequest {

    @NotNull(message = "Business ID is required")
    private UUID businessId;

    @NotNull(message = "Product ID is required")
    private UUID productId;

    private UUID productSizeId;

    @NotNull(message = "Quantity on hand is required")
    @Min(value = 0, message = "Quantity on hand must be >= 0")
    private Integer quantityOnHand;

    @NotNull(message = "Price in is required")
    @DecimalMin(value = "0.01", message = "Price in must be > 0")
    private BigDecimal priceIn;

    private LocalDateTime expiryDate;

    private String barcode;

    private String sku;

    private String location;
}
