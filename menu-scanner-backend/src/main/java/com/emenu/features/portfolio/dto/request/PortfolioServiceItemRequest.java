package com.emenu.features.portfolio.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PortfolioServiceItemRequest {

    private String id;

    @NotBlank
    private String name;

    private String description;
}
