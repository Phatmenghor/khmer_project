package com.emenu.features.auth.mapper;

import com.emenu.enums.user.UserType;
import com.emenu.features.auth.dto.response.RoleResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface ResponseBuilderMapper {

    default RoleResponse buildAllRolesResponse(UUID businessId) {
        RoleResponse response = new RoleResponse();
        response.setId(null);
        response.setName("ALL_ROLES");
        response.setDescription("All Roles");
        response.setBusinessId(businessId);
        response.setUserType(UserType.BUSINESS_USER);
        return response;
    }
}
