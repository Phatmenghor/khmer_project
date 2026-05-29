package com.emenu.features.auth.mapper;

import com.emenu.enums.common.StockStatus;
import com.emenu.shared.constants.BusinessConstants;
import com.emenu.features.auth.dto.request.BusinessSettingCreateRequest;
import com.emenu.features.auth.dto.response.BusinessSettingResponse;
import com.emenu.features.auth.dto.update.BusinessSettingUpdateRequest;
import com.emenu.features.auth.models.BusinessSetting;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = { SocialMediaMapper.class, BusinessHoursMapper.class })
public interface BusinessSettingMapper {

    BusinessSettingResponse toResponse(BusinessSetting businessSetting);

    @AfterMapping
    default void applyDefaultsAfterResponse(@MappingTarget BusinessSettingResponse response) {
        if (response.getPrimaryColor() == null) {
            response.setPrimaryColor(BusinessConstants.DEFAULT_PRIMARY_COLOR);
        }
        if (response.getLowStockThreshold() == null) {
            response.setLowStockThreshold(BusinessConstants.DEFAULT_LOW_STOCK_THRESHOLD);
        }
    }

    BusinessSetting toEntity(BusinessSettingCreateRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(BusinessSettingUpdateRequest request, @MappingTarget BusinessSetting businessSetting);

    @AfterMapping
    default void setBusinessSettingIdForHours(@MappingTarget BusinessSetting businessSetting) {
        if (businessSetting.getBusinessHours() != null) {
            businessSetting.getBusinessHours().forEach(hour -> hour.setBusinessSettingId(businessSetting.getId()));
        }
    }

    @AfterMapping
    default void applyDefaultsAfterCreate(@MappingTarget BusinessSetting businessSetting) {
        if (businessSetting.getPrimaryColor() == null) {
            businessSetting.setPrimaryColor(BusinessConstants.DEFAULT_PRIMARY_COLOR);
        }
        if (businessSetting.getTaxPercentage() == null) {
            businessSetting.setTaxPercentage(BusinessConstants.DEFAULT_TAX_PERCENTAGE);
        }
        if (businessSetting.getLowStockThreshold() == null) {
            businessSetting.setLowStockThreshold(BusinessConstants.DEFAULT_LOW_STOCK_THRESHOLD);
        }
        if (businessSetting.getEnableStock() == null) {
            businessSetting.setEnableStock(StockStatus.ENABLED);
        }
        if (businessSetting.getUseBrands() == null) {
            businessSetting.setUseBrands(true);
        }
    }

    List<BusinessSettingResponse> toResponseList(List<BusinessSetting> businessSettings);
}