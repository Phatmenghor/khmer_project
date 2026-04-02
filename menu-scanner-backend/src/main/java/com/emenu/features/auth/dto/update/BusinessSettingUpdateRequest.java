package com.emenu.features.auth.dto.update;

import com.emenu.features.auth.dto.response.SocialMediaResponse;
import com.emenu.features.auth.enums.StockStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.util.List;

/**
 * Business Settings Update Request DTO
 * Contains only essential fields for business settings update
 */
@Data
public class BusinessSettingUpdateRequest {

    private String businessName;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    private Double taxPercentage;

    private String logoBusinessUrl;

    private StockStatus enableStock;

    private List<SocialMediaResponse> socialMedia;

    private String primaryColor;

    private String secondaryColor;

    private String accentColor;
}
