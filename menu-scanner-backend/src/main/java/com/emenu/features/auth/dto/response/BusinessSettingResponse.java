package com.emenu.features.auth.dto.response;

import com.emenu.enums.common.StockStatus;
import com.emenu.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class BusinessSettingResponse extends BaseAuditResponse {

    private UUID businessId;
    private String businessName;
    private Double taxPercentage;
    private String logoBusinessUrl;
    private StockStatus enableStock;
    private List<SocialMediaResponse> socialMedia;
    private String primaryColor;

    private String contactAddress;
    private String contactPhone;
    private String contactEmail;

    private List<BusinessHoursResponse> businessHours;

    private Boolean useCategories;
    private Boolean useBrands;
}