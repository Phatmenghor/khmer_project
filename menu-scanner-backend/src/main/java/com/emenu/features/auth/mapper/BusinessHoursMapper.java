package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.request.BusinessHoursRequest;
import com.emenu.features.auth.dto.response.BusinessHoursResponse;
import com.emenu.features.auth.models.BusinessHours;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BusinessHoursMapper {

    BusinessHoursResponse toResponse(BusinessHours businessHours);

    BusinessHours toEntity(BusinessHoursResponse response);

    BusinessHours toEntity(BusinessHoursRequest request);
}
