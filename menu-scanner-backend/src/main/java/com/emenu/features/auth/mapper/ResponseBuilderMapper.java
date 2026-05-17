package com.emenu.features.auth.mapper;

import com.emenu.enums.user.UserType;
import com.emenu.features.auth.dto.response.RoleResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface ResponseBuilderMapper {

    @Mapping(target = "id", constant = "null")
    @Mapping(target = "name", constant = "ALL_ROLES")
    @Mapping(target = "description", constant = "All Roles")
    @Mapping(target = "businessId", source = "businessId")
    @Mapping(target = "userType", expression = "java(UserType.BUSINESS_USER)")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    RoleResponse buildAllRolesResponse(UUID businessId);
}
