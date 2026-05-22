package com.emenu.features.portfolio.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class PortfolioHoursRequest {

    private UUID id;

    @NotBlank
    private String day;

    private String openTime;

    private String closeTime;
}
