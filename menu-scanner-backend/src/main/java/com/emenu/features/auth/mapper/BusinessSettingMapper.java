package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.request.BusinessSettingCreateRequest;
import com.emenu.features.auth.dto.response.BusinessSettingResponse;
import com.emenu.features.auth.dto.update.BusinessSettingUpdateRequest;
import com.emenu.features.auth.models.BusinessSetting;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = SocialMediaMapper.class)
public interface BusinessSettingMapper {

    @Mapping(target = "businessName", source = "business.name")
    @Mapping(target = "logoBusinesssUrl", source = "logoUrl")
    BusinessSettingResponse toResponse(BusinessSetting businessSetting);

    @Mapping(target = "logoUrl", source = "logoBusinesssUrl")
    BusinessSetting toEntity(BusinessSettingCreateRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "logoUrl", source = "logoBusinesssUrl")
    void updateEntity(BusinessSettingUpdateRequest request, @MappingTarget BusinessSetting businessSetting);
}