package com.emenu.features.main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductCustomizationGroupDto {

    private UUID id;

    private UUID productId;

    private String name;

    private String description;

    private Boolean isRequired;

    private Boolean allowMultiple;

    private Integer sortOrder;

    private String status;

    private List<ProductCustomizationDto> customizations;
}
