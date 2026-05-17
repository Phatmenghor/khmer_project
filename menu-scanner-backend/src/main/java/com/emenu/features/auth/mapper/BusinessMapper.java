package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.request.BusinessCreateRequest;
import com.emenu.features.auth.dto.response.BusinessResponse;
import com.emenu.features.auth.models.Business;
import com.emenu.shared.dto.PaginationResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BusinessMapper {

    @Mapping(target = "hasActiveSubscription", expression = "java(business.hasActiveSubscription())")
    BusinessResponse toResponse(Business business);

    Business toEntity(BusinessCreateRequest request);

    List<BusinessResponse> toResponseList(List<Business> businesses);

    default PaginationResponse<BusinessResponse> toPaginationResponse(Page<Business> page) {
        List<BusinessResponse> content = toResponseList(page.getContent());
        return PaginationResponse.<BusinessResponse>builder()
                .content(content)
                .pageNo(page.getNumber() + 1)
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
