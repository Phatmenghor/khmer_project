package com.emenu.features.auth.mapper;

import com.emenu.enums.common.StockStatus;
import com.emenu.enums.common.ReceiptSize;
import com.emenu.shared.constants.BusinessConstants;
import com.emenu.features.auth.dto.request.BusinessSettingCreateRequest;
import com.emenu.features.auth.dto.response.BusinessSettingResponse;
import com.emenu.features.auth.dto.update.BusinessSettingUpdateRequest;
import com.emenu.features.auth.models.BusinessSetting;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = { SocialMediaMapper.class, BusinessHoursMapper.class })
public interface BusinessSettingMapper {

    @Mapping(source = "business.name", target = "businessName")
    @Mapping(source = "business.description", target = "contactAddress")
    @Mapping(source = "business.phone", target = "contactPhone")
    @Mapping(source = "business.email", target = "contactEmail")
    BusinessSettingResponse toResponse(BusinessSetting businessSetting);

    @AfterMapping
    default void applyDefaultsAfterResponse(@MappingTarget BusinessSettingResponse response) {

        if (response.getLowStockThreshold() == null) {
            response.setLowStockThreshold(BusinessConstants.DEFAULT_LOW_STOCK_THRESHOLD);
        }
        if (response.getReceiptSize() == null) {
            response.setReceiptSize(ReceiptSize.SIZE_58MM);
        }
    }

    BusinessSetting toEntity(BusinessSettingCreateRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(BusinessSettingUpdateRequest request, @MappingTarget BusinessSetting businessSetting);

    @AfterMapping
    default void setBusinessSettingIdForRelations(@MappingTarget BusinessSetting businessSetting) {
        if (businessSetting.getBusinessHours() != null) {
            businessSetting.getBusinessHours().forEach(hour -> hour.setBusinessSettingId(businessSetting.getId()));
        }
        if (businessSetting.getSocialMedia() != null) {
            businessSetting.getSocialMedia().forEach(media -> media.setBusinessSettingId(businessSetting.getId()));
        }
    }

    @AfterMapping
    default void applyDefaultsAfterCreate(@MappingTarget BusinessSetting businessSetting) {

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
        if (businessSetting.getReceiptSize() == null) {
            businessSetting.setReceiptSize(ReceiptSize.SIZE_58MM);
        }
    }

    List<BusinessSettingResponse> toResponseList(List<BusinessSetting> businessSettings);
}