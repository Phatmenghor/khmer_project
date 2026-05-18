package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.request.RoleCreateRequest;
import com.emenu.features.auth.dto.response.RoleDetailResponse;
import com.emenu.features.auth.dto.response.RoleResponse;
import com.emenu.features.auth.dto.update.RoleUpdateRequest;
import com.emenu.features.auth.models.Role;
import org.mapstruct.*;

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
}
