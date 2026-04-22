package com.emenu.features.main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductCustomizationDto {

    private UUID id;

    private UUID productCustomizationGroupId;

    private String name;

    private String description;

    private BigDecimal priceAdjustment;

    private Integer sortOrder;

    private String status;
}
