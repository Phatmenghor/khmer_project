package com.emenu.features.portfolio.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PortfolioHoursRequest {

    @NotBlank
    private String day;

    @NotNull
    private Boolean isOpen;

    private String openTime;

    private String closeTime;

    private Boolean is24Hours = false;

    private Integer displayOrder = 0;
}
