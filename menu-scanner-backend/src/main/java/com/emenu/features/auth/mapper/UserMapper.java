package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.request.RegisterRequest;
import com.emenu.features.auth.dto.request.UserCreateRequest;
import com.emenu.features.auth.dto.response.*;
import com.emenu.features.auth.dto.update.UserUpdateRequest;
import com.emenu.features.auth.models.*;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import org.mapstruct.*;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {PaginationMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    @Mapping(target = "fullName",          expression = "java(user.getFullName())")
    @Mapping(target = "businessName",      source = "business.name")
    @Mapping(target = "roles",             source = "roles", qualifiedByName = "rolesToStrings")
    @Mapping(target = "telegramSynced",    expression = "java(user.getTelegram() != null)")
    // Personal from profile
    @Mapping(target = "email",             source = "profile.email")
    @Mapping(target = "firstName",         source = "profile.firstName")
    @Mapping(target = "lastName",          source = "profile.lastName")
    @Mapping(target = "nickname",          source = "profile.nickname")
    @Mapping(target = "gender",            source = "profile.gender")
    @Mapping(target = "dateOfBirth",       source = "profile.dateOfBirth")
    @Mapping(target = "phoneNumber",       source = "profile.phoneNumber")
    @Mapping(target = "profileImageUrl",   source = "profile.profileImageUrl")
    // Employment from employment
    @Mapping(target = "employeeId",        source = "employment.employeeId")
    @Mapping(target = "position",          source = "employment.position")
    @Mapping(target = "department",        source = "employment.department")
    @Mapping(target = "employmentType",    source = "employment.employmentType")
    @Mapping(target = "joinDate",          source = "employment.joinDate")
    @Mapping(target = "leaveDate",         source = "employment.leaveDate")
    @Mapping(target = "shift",             source = "employment.shift")
    // Telegram from telegram
    @Mapping(target = "telegramId",        source = "telegram.telegramId")
    @Mapping(target = "telegramUsername",  source = "telegram.telegramUsername")
    @Mapping(target = "telegramFirstName", source = "telegram.telegramFirstName")
    @Mapping(target = "telegramLastName",  source = "telegram.telegramLastName")
    @Mapping(target = "telegramPhotoUrl",  source = "telegram.telegramPhotoUrl")
    @Mapping(target = "telegramSyncedAt",  source = "telegram.telegramSyncedAt")
    UserResponse toResponse(User user);

    @Mapping(target = "telegramSynced",    expression = "java(user.getTelegram() != null)")
    @Mapping(target = "firstName",         source = "profile.firstName")
    @Mapping(target = "lastName",          source = "profile.lastName")
    @Mapping(target = "email",             source = "profile.email")
    @Mapping(target = "phoneNumber",       source = "profile.phoneNumber")
    @Mapping(target = "profileImageUrl",   source = "profile.profileImageUrl")
    @Mapping(target = "telegramId",        source = "telegram.telegramId")
    @Mapping(target = "telegramUsername",  source = "telegram.telegramUsername")
    @Mapping(target = "telegramSyncedAt",  source = "telegram.telegramSyncedAt")
    UserBasicInfo toUserBasicInfo(User user);

    @Mapping(target = "userId",            source = "user.id")
    @Mapping(target = "fullName",          expression = "java(user.getFullName())")
    @Mapping(target = "roles",             source = "user.roles", qualifiedByName = "rolesToStrings")
    @Mapping(target = "businessName",      source = "user.business.name")
    @Mapping(target = "accessToken",       source = "token")
    @Mapping(target = "tokenType",         constant = "Bearer")
    @Mapping(target = "telegramSynced",    expression = "java(user.getTelegram() != null)")
    @Mapping(target = "email",             source = "user.profile.email")
    @Mapping(target = "profileImageUrl",   source = "user.profile.profileImageUrl")
    @Mapping(target = "telegramId",        source = "user.telegram.telegramId")
    @Mapping(target = "telegramUsername",  source = "user.telegram.telegramUsername")
    @Mapping(target = "telegramFirstName", source = "user.telegram.telegramFirstName")
    @Mapping(target = "telegramLastName",  source = "user.telegram.telegramLastName")
    @Mapping(target = "telegramSyncedAt",  source = "user.telegram.telegramSyncedAt")
    LoginResponse toLoginResponse(User user, String token);

    List<UserResponse> toResponseList(List<User> users);

    AddressResponse toAddressResponse(UserAddress address);
    EmergencyContactResponse toEmergencyContactResponse(UserEmergencyContact contact);
    DocumentResponse toDocumentResponse(UserDocument document);
    EducationResponse toEducationResponse(UserEducation education);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "roles",             ignore = true)
    @Mapping(target = "password",          ignore = true)
    @Mapping(target = "profile",           ignore = true)
    @Mapping(target = "employment",        ignore = true)
    @Mapping(target = "telegram",          ignore = true)
    @Mapping(target = "addresses",         ignore = true)
    @Mapping(target = "emergencyContacts", ignore = true)
    @Mapping(target = "documents",         ignore = true)
    @Mapping(target = "educations",        ignore = true)
    void updateEntity(UserUpdateRequest request, @MappingTarget User user);

    @Mapping(target = "roles",             ignore = true)
    @Mapping(target = "password",          ignore = true)
    @Mapping(target = "profile",           ignore = true)
    @Mapping(target = "employment",        ignore = true)
    @Mapping(target = "telegram",          ignore = true)
    @Mapping(target = "addresses",         ignore = true)
    @Mapping(target = "emergencyContacts", ignore = true)
    @Mapping(target = "documents",         ignore = true)
    @Mapping(target = "educations",        ignore = true)
    User toEntity(UserCreateRequest request);

    @Mapping(target = "roles",             ignore = true)
    @Mapping(target = "password",          ignore = true)
    @Mapping(target = "profile",           ignore = true)
    @Mapping(target = "employment",        ignore = true)
    @Mapping(target = "telegram",          ignore = true)
    @Mapping(target = "addresses",         ignore = true)
    @Mapping(target = "emergencyContacts", ignore = true)
    @Mapping(target = "documents",         ignore = true)
    @Mapping(target = "educations",        ignore = true)
    User toEntity(RegisterRequest request);

    @Named("rolesToStrings")
    default List<String> rolesToStrings(List<Role> roles) {
        if (roles == null) return List.of();
        return roles.stream().map(Role::getName).collect(Collectors.toList());
    }

    @Named("rolesToEnums")
    default List<String> rolesToEnums(List<Role> roles) {
        return rolesToStrings(roles);
    }

    default PaginationResponse<UserResponse> toPaginationResponse(Page<User> page, PaginationMapper paginationMapper) {
        return paginationMapper.toPaginationResponse(page, this::toResponseList);
    }
}
