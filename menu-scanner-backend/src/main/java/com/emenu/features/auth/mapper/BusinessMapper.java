package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.request.BusinessCreateRequest;
import com.emenu.features.auth.dto.response.BusinessResponse;
import com.emenu.features.auth.models.Business;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BusinessMapper {

    @Mapping(target = "hasActiveSubscription", expression = "java(business.hasActiveSubscription())")
    BusinessResponse toResponse(Business business);

    Business toEntity(BusinessCreateRequest request);

    List<BusinessResponse> toResponseList(List<Business> businesses);
}
