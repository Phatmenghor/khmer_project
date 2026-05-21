package com.emenu.features.portfolio.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PortfolioCustomStatRequest {

    @NotBlank
    private String label;

    @NotBlank
    private String value;

    private Integer displayOrder = 0;
}
