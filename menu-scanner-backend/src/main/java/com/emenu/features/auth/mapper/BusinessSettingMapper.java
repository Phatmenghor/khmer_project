package com.emenu.features.auth.mapper;

import com.emenu.features.auth.constants.BusinessSettingConstants;
import com.emenu.features.auth.dto.request.BusinessSettingCreateRequest;
import com.emenu.features.auth.dto.response.BusinessSettingResponse;
import com.emenu.features.auth.dto.update.BusinessSettingUpdateRequest;
import com.emenu.features.auth.models.BusinessSetting;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = SocialMediaMapper.class)
public interface BusinessSettingMapper {

    @Mapping(target = "businessName", source = "businessName")
    BusinessSettingResponse toResponse(BusinessSetting businessSetting);

    /**
     * Apply default values to BusinessSettingResponse if fields are null
     */
    @AfterMapping
    default void applyDefaultsAfterResponse(@MappingTarget BusinessSettingResponse response) {
        if (response.getBusinessName() == null || response.getBusinessName().isEmpty()) {
            response.setBusinessName(BusinessSettingConstants.DEFAULT_BUSINESS_NAME);
        }
        if (response.getPrimaryColor() == null) {
            response.setPrimaryColor(BusinessSettingConstants.DEFAULT_PRIMARY_COLOR);
        }
    }

    BusinessSetting toEntity(BusinessSettingCreateRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(BusinessSettingUpdateRequest request, @MappingTarget BusinessSetting businessSetting);

    /**
     * Apply default values to BusinessSetting after mapping from CreateRequest
     */
    @AfterMapping
    default void applyDefaultsAfterCreate(@MappingTarget BusinessSetting businessSetting) {
        if (businessSetting.getBusinessName() == null || businessSetting.getBusinessName().isEmpty()) {
            businessSetting.setBusinessName(BusinessSettingConstants.DEFAULT_BUSINESS_NAME);
        }
        if (businessSetting.getPrimaryColor() == null) {
            businessSetting.setPrimaryColor(BusinessSettingConstants.DEFAULT_PRIMARY_COLOR);
        }
        if (businessSetting.getTaxPercentage() == null) {
            businessSetting.setTaxPercentage(BusinessSettingConstants.DEFAULT_TAX_PERCENTAGE);
        }
    }
}