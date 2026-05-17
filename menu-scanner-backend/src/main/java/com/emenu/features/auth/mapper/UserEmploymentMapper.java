package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.request.UserCreateRequest;
import com.emenu.features.auth.dto.update.UserUpdateRequest;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.models.UserEmployment;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface UserEmploymentMapper {

    default UserEmployment createFromRequest(UserCreateRequest request, User user) {
        UserEmployment employment = new UserEmployment();
        employment.setUser(user);
        employment.setEmployeeId(request.getEmployeeId());
        employment.setPosition(request.getPosition());
        employment.setDepartment(request.getDepartment());
        employment.setEmploymentType(request.getEmploymentType());
        employment.setJoinDate(request.getJoinDate());
        employment.setLeaveDate(request.getLeaveDate());
        employment.setShift(request.getShift());
        return employment;
    }

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateFromRequest(UserUpdateRequest request, @MappingTarget UserEmployment employment);
}
