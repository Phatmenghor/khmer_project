package com.emenu.features.main.dto.request;

import com.emenu.enums.product.PromotionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class BulkPromotionCreateDto {

    @NotEmpty(message = "At least one product must be selected")
    private List<UUID> productIds;

    @NotNull(message = "Promotion type is required")
    private PromotionType promotionType;

    @NotNull(message = "Promotion value is required")
    @DecimalMin(value = "0.01", message = "Promotion value must be greater than 0")
    private BigDecimal promotionValue;

    @NotNull(message = "Promotion from date is required")
    private LocalDateTime promotionFromDate;

    @NotNull(message = "Promotion to date is required")
    private LocalDateTime promotionToDate;
}
