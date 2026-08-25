package com.emenu.features.main.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductCustomizationCreateDto {

    @NotBlank(message = "Add-on name is required")
    private String name;

    @NotNull(message = "Price adjustment is required")
    private BigDecimal priceAdjustment;
}
