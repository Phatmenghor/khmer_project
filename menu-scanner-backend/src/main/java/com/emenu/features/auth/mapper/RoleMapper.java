package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.request.RoleCreateRequest;
import com.emenu.features.auth.dto.response.RoleDetailResponse;
import com.emenu.features.auth.dto.response.RoleResponse;
import com.emenu.features.auth.dto.update.RoleUpdateRequest;
import com.emenu.features.auth.models.Role;
import com.emenu.shared.dto.PaginationResponse;
import org.mapstruct.*;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RoleMapper {

    RoleResponse toResponse(Role role);

    List<RoleResponse> toResponseList(List<Role> roles);

    @Mapping(target = "businessName", ignore = true)
    RoleDetailResponse toDetailResponse(Role role);

    Role toEntity(RoleCreateRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(RoleUpdateRequest request, @MappingTarget Role role);

    default PaginationResponse<RoleResponse> toPaginationResponse(Page<Role> page) {
        List<RoleResponse> content = toResponseList(page.getContent());
        return PaginationResponse.<RoleResponse>builder()
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

    default PaginationResponse<RoleResponse> toPaginationResponseWithAllRoles(Page<Role> page, RoleResponse allRolesResponse, boolean isFirstPage) {
        List<RoleResponse> content = new java.util.ArrayList<>(toResponseList(page.getContent()));
        if (isFirstPage) {
            content.add(0, allRolesResponse);
        }
        return PaginationResponse.<RoleResponse>builder()
                .content(content)
                .pageNo(page.getNumber() + 1)
                .pageSize(page.getSize())
                .totalElements(isFirstPage ? page.getTotalElements() + 1 : page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
