package com.emenu.features.main.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductCustomizationGroupCreateDto {

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotBlank(message = "Customization group name is required")
    private String name;

    private String description;

    private Boolean isRequired = false;

    private Boolean allowMultiple = true;

    private Integer sortOrder = 0;

    private String status = "ACTIVE";
}
