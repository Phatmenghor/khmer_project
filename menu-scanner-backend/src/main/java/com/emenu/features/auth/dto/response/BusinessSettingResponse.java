package com.emenu.features.auth.dto.response;

import com.emenu.features.auth.enums.StockStatus;
import com.emenu.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
import java.util.UUID;

/**
 * Business Settings Response DTO
 * Contains essential business settings information only
 * Response from /api/v1/business-settings/current
 */
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

    // Contact Information
    private String contactAddress;
    private String contactPhone;
    private String contactEmail;

    // Business Hours
    private List<BusinessHoursResponse> businessHours;

    // Feature Visibility Flags
    private Boolean useCategories;
    private Boolean useSubcategories;
    private Boolean useBrands;
}