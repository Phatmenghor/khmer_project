package com.emenu.features.main.dto.request;

import com.emenu.enums.common.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class SubcategoryCreateRequest {

    @NotNull(message = "Category ID is required")
    private UUID categoryId;

    @NotBlank(message = "Subcategory name is required")
    private String name;

    private String imageUrl;
    private Status status = Status.ACTIVE;
}
