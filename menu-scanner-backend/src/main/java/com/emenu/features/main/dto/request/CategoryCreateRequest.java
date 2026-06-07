package com.emenu.features.main.dto.request;

import com.emenu.enums.common.Status;
import com.emenu.shared.dto.ImageUrls;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryCreateRequest {

    @NotBlank(message = "Category name is required")
    private String name;

    private ImageUrls image;
    private String description;
    private Status status = Status.ACTIVE;
}