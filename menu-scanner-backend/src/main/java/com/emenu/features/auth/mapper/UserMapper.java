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
    @Mapping(target = "profile",           qualifiedByName = "updateProfile")
    @Mapping(target = "employment",        qualifiedByName = "updateEmployment")
    @Mapping(target = "telegram",          ignore = true)
    @Mapping(target = "addresses",         qualifiedByName = "updateAddresses")
    @Mapping(target = "emergencyContacts", qualifiedByName = "updateEmergencyContacts")
    @Mapping(target = "documents",         qualifiedByName = "updateDocuments")
    @Mapping(target = "educations",        qualifiedByName = "updateEducations")
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

    // ─── Custom Nested Object Updaters ────────────────────────────────────

    /**
     * Updates the UserProfile with fields from the UserUpdateRequest.
     * Only updates fields that are not null in the request.
     */
    @Named("updateProfile")
    default void updateProfile(UserUpdateRequest request, @MappingTarget User user) {
        if (user.getProfile() == null) {
            user.setProfile(new UserProfile());
        }
        UserProfile profile = user.getProfile();

        if (request.getEmail() != null) profile.setEmail(request.getEmail());
        if (request.getFirstName() != null) profile.setFirstName(request.getFirstName());
        if (request.getLastName() != null) profile.setLastName(request.getLastName());
        if (request.getNickname() != null) profile.setNickname(request.getNickname());
        if (request.getGender() != null) profile.setGender(request.getGender());
        if (request.getDateOfBirth() != null) profile.setDateOfBirth(request.getDateOfBirth());
        if (request.getPhoneNumber() != null) profile.setPhoneNumber(request.getPhoneNumber());
        if (request.getProfileImageUrl() != null) profile.setProfileImageUrl(request.getProfileImageUrl());
    }

    /**
     * Updates the UserEmployment with fields from the UserUpdateRequest.
     * Only updates fields that are not null in the request.
     */
    @Named("updateEmployment")
    default void updateEmployment(UserUpdateRequest request, @MappingTarget User user) {
        // Check if there are any employment fields to update
        if (request.getEmployeeId() == null && request.getPosition() == null &&
            request.getDepartment() == null && request.getEmploymentType() == null &&
            request.getJoinDate() == null && request.getLeaveDate() == null &&
            request.getShift() == null) {
            return; // No employment data to update
        }

        if (user.getEmployment() == null) {
            user.setEmployment(new UserEmployment());
        }
        UserEmployment employment = user.getEmployment();

        if (request.getEmployeeId() != null) employment.setEmployeeId(request.getEmployeeId());
        if (request.getPosition() != null) employment.setPosition(request.getPosition());
        if (request.getDepartment() != null) employment.setDepartment(request.getDepartment());
        if (request.getEmploymentType() != null) employment.setEmploymentType(request.getEmploymentType());
        if (request.getJoinDate() != null) employment.setJoinDate(request.getJoinDate());
        if (request.getLeaveDate() != null) employment.setLeaveDate(request.getLeaveDate());
        if (request.getShift() != null) employment.setShift(request.getShift());
    }

    /**
     * Handles address list updates with proper merge logic.
     * Null/empty list = no change, otherwise replaces all addresses.
     */
    @Named("updateAddresses")
    default void updateAddresses(List<AddressRequest> requests, @MappingTarget User user) {
        if (requests == null) {
            return; // Null = no change
        }
        if (requests.isEmpty()) {
            user.getAddresses().clear(); // Empty list = clear all
            return;
        }
        // Non-empty list = replace all with mapped addresses
        user.setAddresses(requests.stream()
                .map(this::toAddressEntity)
                .collect(Collectors.toList()));
    }

    /**
     * Handles emergency contact list updates with proper merge logic.
     */
    @Named("updateEmergencyContacts")
    default void updateEmergencyContacts(List<EmergencyContactRequest> requests, @MappingTarget User user) {
        if (requests == null) {
            return; // Null = no change
        }
        if (requests.isEmpty()) {
            user.getEmergencyContacts().clear(); // Empty list = clear all
            return;
        }
        // Non-empty list = replace all with mapped contacts
        user.setEmergencyContacts(requests.stream()
                .map(this::toEmergencyContactEntity)
                .collect(Collectors.toList()));
    }

    /**
     * Handles document list updates with proper merge logic.
     */
    @Named("updateDocuments")
    default void updateDocuments(List<DocumentRequest> requests, @MappingTarget User user) {
        if (requests == null) {
            return; // Null = no change
        }
        if (requests.isEmpty()) {
            user.getDocuments().clear(); // Empty list = clear all
            return;
        }
        // Non-empty list = replace all with mapped documents
        user.setDocuments(requests.stream()
                .map(this::toDocumentEntity)
                .collect(Collectors.toList()));
    }

    /**
     * Handles education list updates with proper merge logic.
     */
    @Named("updateEducations")
    default void updateEducations(List<EducationRequest> requests, @MappingTarget User user) {
        if (requests == null) {
            return; // Null = no change
        }
        if (requests.isEmpty()) {
            user.getEducations().clear(); // Empty list = clear all
            return;
        }
        // Non-empty list = replace all with mapped educations
        user.setEducations(requests.stream()
                .map(this::toEducationEntity)
                .collect(Collectors.toList()));
    }

    // ─── Entity Mapping Methods (Convert DTOs to Entities) ────────────────

    /**
     * Converts AddressRequest DTO to UserAddress entity.
     */
    default UserAddress toAddressEntity(AddressRequest request) {
        UserAddress address = new UserAddress();
        address.setId(request.getId());
        address.setAddressType(request.getAddressType());
        address.setHouseNo(request.getHouseNo());
        address.setStreet(request.getStreet());
        address.setVillage(request.getVillage());
        address.setCommune(request.getCommune());
        address.setDistrict(request.getDistrict());
        address.setProvince(request.getProvince());
        address.setCountry(request.getCountry());
        return address;
    }

    /**
     * Converts EmergencyContactRequest DTO to UserEmergencyContact entity.
     */
    default UserEmergencyContact toEmergencyContactEntity(EmergencyContactRequest request) {
        UserEmergencyContact contact = new UserEmergencyContact();
        contact.setId(request.getId());
        contact.setName(request.getName());
        contact.setPhone(request.getPhone());
        contact.setRelationship(request.getRelationship());
        return contact;
    }

    /**
     * Converts DocumentRequest DTO to UserDocument entity.
     */
    default UserDocument toDocumentEntity(DocumentRequest request) {
        UserDocument document = new UserDocument();
        document.setId(request.getId());
        document.setType(request.getType());
        document.setNumber(request.getNumber());
        document.setFileUrl(request.getFileUrl());
        return document;
    }

    /**
     * Converts EducationRequest DTO to UserEducation entity.
     */
    default UserEducation toEducationEntity(EducationRequest request) {
        UserEducation education = new UserEducation();
        education.setId(request.getId());
        education.setLevel(request.getLevel());
        education.setSchoolName(request.getSchoolName());
        education.setFieldOfStudy(request.getFieldOfStudy());
        education.setStartYear(request.getStartYear());
        education.setEndYear(request.getEndYear());
        education.setIsGraduated(request.getIsGraduated() != null ? request.getIsGraduated() : false);
        education.setCertificateUrl(request.getCertificateUrl());
        return education;
    }
}
