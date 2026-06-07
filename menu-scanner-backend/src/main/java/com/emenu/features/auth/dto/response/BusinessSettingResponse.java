package com.emenu.features.auth.dto.response;

import com.emenu.enums.common.StockStatus;
import com.emenu.shared.dto.BaseAuditResponse;
import com.emenu.shared.dto.ImageUrls;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class BusinessSettingResponse extends BaseAuditResponse {

    private UUID businessId;
    private String businessName;
    private String contactAddress;
    private String contactPhone;
    private String contactEmail;
    private Double taxPercentage;
    private ImageUrls logoBusiness;
    private StockStatus enableStock;
    private List<SocialMediaResponse> socialMedia;
    private String primaryColor;
    private List<BusinessHoursResponse> businessHours;
    private Boolean useBrands;
    private Integer lowStockThreshold;
    private String telegramGroupChatId;
}