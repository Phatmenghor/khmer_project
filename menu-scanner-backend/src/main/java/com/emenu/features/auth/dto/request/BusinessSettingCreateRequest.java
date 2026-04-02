package com.emenu.features.auth.dto.request;

import com.emenu.features.auth.dto.response.SocialMediaResponse;
import com.emenu.features.auth.enums.StockStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Business Settings Create Request DTO
 * Contains only essential fields for creating business settings
 */
@Data
public class BusinessSettingCreateRequest {

    @NotNull(message = "Business ID is required")
    private UUID businessId;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    private Double taxPercentage;

    private String logoBusinesssUrl;

    private StockStatus enableStock;

    private List<SocialMediaResponse> socialMedia;
}
