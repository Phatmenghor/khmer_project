package com.emenu.features.hr.mapper;

import com.emenu.features.auth.mapper.UserMapper;
import com.emenu.features.hr.dto.request.LeaveCreateRequest;
import com.emenu.features.hr.dto.response.LeaveResponse;
import com.emenu.features.hr.dto.update.LeaveUpdateRequest;
import com.emenu.features.hr.models.Leave;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class}, unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface LeaveMapper {

    @Mapping(target = "userInfo.id", source = "user.id")
    @Mapping(target = "userInfo.firstName", source = "user.profile.firstName")
    @Mapping(target = "userInfo.lastName", source = "user.profile.lastName")
    @Mapping(target = "userInfo.email", source = "user.profile.email")
    @Mapping(target = "userInfo.phoneNumber", source = "user.profile.phoneNumber")
    @Mapping(target = "userInfo.profileImage", source = "user.profile.profileImage")
    @Mapping(target = "userInfo.roles", source = "user.roles", qualifiedByName = "rolesToStrings")
    @Mapping(target = "actionUserInfo.id", source = "actionUser.id")
    @Mapping(target = "actionUserInfo.firstName", source = "actionUser.profile.firstName")
    @Mapping(target = "actionUserInfo.lastName", source = "actionUser.profile.lastName")
    @Mapping(target = "actionUserInfo.email", source = "actionUser.profile.email")
    @Mapping(target = "actionUserInfo.phoneNumber", source = "actionUser.profile.phoneNumber")
    @Mapping(target = "actionUserInfo.profileImage", source = "actionUser.profile.profileImage")
    @Mapping(target = "actionUserInfo.roles", source = "actionUser.roles", qualifiedByName = "rolesToStrings")
    LeaveResponse toResponse(Leave leave);

    List<LeaveResponse> toResponseList(List<Leave> leaves);

    Leave toEntity(LeaveCreateRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(LeaveUpdateRequest request, @MappingTarget Leave leave);
}
