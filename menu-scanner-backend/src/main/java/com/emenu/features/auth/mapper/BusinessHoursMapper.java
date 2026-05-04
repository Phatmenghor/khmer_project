package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.response.BusinessHoursResponse;
import com.emenu.features.auth.models.BusinessHours;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * Business Hours Mapper
 * Maps between BusinessHours entity and BusinessHoursResponse DTO
 * Handles field name mapping: openingTime -> openTime, closingTime -> closeTime
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BusinessHoursMapper {

    @Mapping(source = "openingTime", target = "openTime")
    @Mapping(source = "closingTime", target = "closeTime")
    BusinessHoursResponse toResponse(BusinessHours businessHours);

    @Mapping(source = "openTime", target = "openingTime")
    @Mapping(source = "closeTime", target = "closingTime")
    BusinessHours toEntity(BusinessHoursResponse response);
}
