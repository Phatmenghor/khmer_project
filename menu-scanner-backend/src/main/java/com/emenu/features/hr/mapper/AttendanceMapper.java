package com.emenu.features.hr.mapper;

import com.emenu.features.hr.dto.helper.AttendanceCreateHelper;
import com.emenu.features.hr.dto.response.AttendanceResponse;
import com.emenu.features.hr.dto.update.AttendanceUpdateRequest;
import com.emenu.features.hr.models.Attendance;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", uses = {AttendanceCheckInMapper.class}, unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface AttendanceMapper {

    @Mapping(target = "userInfo.id", source = "user.id")
    @Mapping(target = "userInfo.firstName", source = "user.profile.firstName")
    @Mapping(target = "userInfo.lastName", source = "user.profile.lastName")
    @Mapping(target = "userInfo.email", source = "user.profile.email")
    @Mapping(target = "userInfo.phoneNumber", source = "user.profile.phoneNumber")
    @Mapping(target = "userInfo.profileImage", source = "user.profile.profileImage")
    AttendanceResponse toResponse(Attendance attendance);

    List<AttendanceResponse> toResponseList(List<Attendance> attendances);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(AttendanceUpdateRequest request, @MappingTarget Attendance attendance);

    Attendance createFromHelper(AttendanceCreateHelper helper);
}
