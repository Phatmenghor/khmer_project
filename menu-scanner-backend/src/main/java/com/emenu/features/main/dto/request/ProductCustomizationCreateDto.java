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

    @NotNull(message = "Product customization group ID is required")
    private UUID productCustomizationGroupId;

    @NotBlank(message = "Customization name is required")
    private String name;

    private String description;

    private BigDecimal priceAdjustment;

    private Integer sortOrder = 0;

    private String status = "ACTIVE";
}
