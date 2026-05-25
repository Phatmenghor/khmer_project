package com.emenu.features.auth.dto.update;

import com.emenu.features.auth.dto.request.SocialMediaRequest;
import com.emenu.features.auth.dto.request.BusinessHoursRequest;
import com.emenu.enums.common.StockStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.util.List;

@Data
public class BusinessSettingUpdateRequest {

    private String businessName;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    private Double taxPercentage;

    private String logoBusinessUrl;

    private StockStatus enableStock;

    private List<SocialMediaRequest> socialMedia;

    private String primaryColor;

    private String contactAddress;

    private String contactPhone;

    private String contactEmail;

    private List<BusinessHoursRequest> businessHours;

    @Min(value = 1, message = "Low stock threshold must be at least 1")
    private Integer lowStockThreshold;

    private String telegramGroupChatId;
}
