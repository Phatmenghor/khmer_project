package com.emenu.features.auth.dto.response;

import com.emenu.enums.common.StockStatus;
import com.emenu.enums.common.ReceiptSize;
import com.emenu.enums.hr.ScanModeEnum;
import com.emenu.features.hr.dto.common.DayShiftDto;
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
    private List<BusinessHoursResponse> businessHours;
    private Boolean useBrands;
    private Integer lowStockThreshold;
    private String telegramGroupChatId;
    private ReceiptSize receiptSize;
    private String wifiName;
    private String wifiPassword;
    private String storeDescription;

    private Boolean enableCheckIn;
    private ScanModeEnum scanMode;
    private List<DayShiftDto> defaultDayShifts;

    private Boolean enableLeaveManagement;
    private Integer annualLeaveDaysPerYear;
    private Integer sickLeaveDaysPerYear;
    private Integer specialLeaveDaysPerYear;
}