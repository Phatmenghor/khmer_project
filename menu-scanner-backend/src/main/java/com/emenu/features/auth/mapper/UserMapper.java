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

    @Mapping(target = "fullName", expression = "java(user.getFullName())")
    @Mapping(target = "businessName", source = "business.name")
    @Mapping(target = "roles", source = "roles", qualifiedByName = "rolesToStrings")
    @Mapping(target = "telegramSynced", expression = "java(user.getTelegramId() != null)")
    @Mapping(target = "address", source = "userAddress")
    UserResponse toResponse(User user);

    @Mapping(target = "telegramSynced", expression = "java(user.getTelegramId() != null)")
    UserBasicInfo toUserBasicInfo(User user);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "fullName", expression = "java(user.getFullName())")
    @Mapping(target = "roles", source = "user.roles", qualifiedByName = "rolesToStrings")
    @Mapping(target = "businessName", source = "user.business.name")
    @Mapping(target = "accessToken", source = "token")
    @Mapping(target = "tokenType", constant = "Bearer")
    @Mapping(target = "telegramSynced", expression = "java(user.getTelegramId() != null)")
    LoginResponse toLoginResponse(User user, String token);

    List<UserResponse> toResponseList(List<User> users);

    // Nested response mappings
    AddressResponse toAddressResponse(UserAddress address);
    EmergencyContactResponse toEmergencyContactResponse(UserEmergencyContact contact);
    DocumentResponse toDocumentResponse(UserDocument document);
    EducationResponse toEducationResponse(UserEducation education);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "userAddress", ignore = true)
    @Mapping(target = "emergencyContacts", ignore = true)
    @Mapping(target = "documents", ignore = true)
    @Mapping(target = "educations", ignore = true)
    void updateEntity(UserUpdateRequest request, @MappingTarget User user);

    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "userAddress", ignore = true)
    @Mapping(target = "emergencyContacts", ignore = true)
    @Mapping(target = "documents", ignore = true)
    @Mapping(target = "educations", ignore = true)
    User toEntity(UserCreateRequest request);

    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "position", ignore = true)
    @Mapping(target = "notes", ignore = true)
    @Mapping(target = "userAddress", ignore = true)
    @Mapping(target = "emergencyContacts", ignore = true)
    @Mapping(target = "documents", ignore = true)
    @Mapping(target = "educations", ignore = true)
    User toEntity(RegisterRequest request);

    @Named("rolesToStrings")
    default List<String> rolesToStrings(List<Role> roles) {
        if (roles == null) return List.of();
        return roles.stream().map(Role::getName).collect(Collectors.toList());
    }

    // Keep legacy name for any existing callers
    @Named("rolesToEnums")
    default List<String> rolesToEnums(List<Role> roles) {
        return rolesToStrings(roles);
    }

    default PaginationResponse<UserResponse> toPaginationResponse(Page<User> page, PaginationMapper paginationMapper) {
        return paginationMapper.toPaginationResponse(page, this::toResponseList);
    }
}
