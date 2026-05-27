package com.emenu.features.auth.dto.request;

import com.emenu.enums.common.StockStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class BusinessSettingCreateRequest {

    @NotNull(message = "Business ID is required")
    private UUID businessId;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    private Double taxPercentage;

    private String logoBusinessUrl;

    private StockStatus enableStock;

    private List<SocialMediaRequest> socialMedia;

    private String primaryColor;

    private List<BusinessHoursRequest> businessHours;

    @Min(value = 1, message = "Low stock threshold must be at least 1")
    private Integer lowStockThreshold;

    private String telegramGroupChatId;
}
