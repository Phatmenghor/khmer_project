package com.emenu.features.portfolio.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PortfolioServiceItemRequest {

    @NotBlank
    private String name;

    private String description;

    private Integer displayOrder = 0;
}
