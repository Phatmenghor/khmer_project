package com.emenu.features.auth.service.impl;

import com.emenu.enums.user.AccountStatus;
import com.emenu.enums.user.UserType;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.dto.filter.UserFilterRequest;
import com.emenu.features.auth.dto.request.*;
import com.emenu.features.auth.dto.response.CustomerUserResponse;
import com.emenu.features.auth.dto.response.UserDetailResponse;
import com.emenu.features.auth.dto.response.UserResponse;
import com.emenu.features.auth.dto.update.UserUpdateRequest;
import com.emenu.features.auth.mapper.UserEmploymentMapper;
import com.emenu.features.auth.mapper.UserMapper;
import com.emenu.features.auth.mapper.UserNestedEntitiesMapper;
import com.emenu.features.auth.mapper.UserProfileMapper;
import com.emenu.features.auth.models.*;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.auth.repository.RoleRepository;
import com.emenu.features.auth.repository.UserRepository;
import com.emenu.features.auth.specification.UserSpecification;
import com.emenu.features.auth.service.BusinessService;
import com.emenu.features.auth.service.UserService;
import com.emenu.features.notification.telegram.service.TelegramNotificationService;
import com.emenu.features.notification.websocket.service.WebSocketNotificationService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.domain.BaseUUIDEntity;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import com.emenu.shared.utils.FilterUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.BiConsumer;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BusinessRepository businessRepository;
    private final BusinessService businessService;
    private final UserMapper userMapper;
    private final UserProfileMapper userProfileMapper;
    private final UserEmploymentMapper userEmploymentMapper;
    private final UserNestedEntitiesMapper userNestedEntitiesMapper;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtils securityUtils;
    private final PaginationMapper paginationMapper;
    private final TelegramNotificationService telegramNotificationService;
    private final WebSocketNotificationService webSocketNotificationService;

    @Override
    public UserResponse createUser(UserCreateRequest requestData) {
        log.info("User creation initiated: identifier={}, type={}, business_id={}",
                requestData.getUserIdentifier(), requestData.getUserType(), requestData.getBusinessId());

        validateUserCreationRequest(requestData);

        User userEntity = buildUserEntity(requestData);
        User savedUserEntity = userRepository.save(userEntity);

        enrichUserWithProfile(requestData, savedUserEntity);
        enrichUserWithEmployment(requestData, savedUserEntity);
        enrichUserWithRelatedEntities(requestData, savedUserEntity);

        savedUserEntity = userRepository.save(savedUserEntity);
        log.info("User created successfully: id={}, identifier={}, type={}, total_related_records={}",
                savedUserEntity.getId(), savedUserEntity.getUserIdentifier(),
                savedUserEntity.getUserType(),
                countTotalRelatedRecords(savedUserEntity));
        webSocketNotificationService.notifyPlatformEvent("USER_CHANGED", Map.of("action", "created", "userId", savedUserEntity.getId().toString()));

        if (requestData.getBusinessId() != null) {
            String firstName = requestData.getFirstName() != null ? requestData.getFirstName() : "";
            String lastName  = requestData.getLastName()  != null ? requestData.getLastName()  : "";
            String fullName  = (firstName + " " + lastName).trim();
            if (fullName.isEmpty()) fullName = requestData.getUserIdentifier();

            telegramNotificationService.notifyNewStaff(
                requestData.getBusinessId(),
                fullName,
                requestData.getPosition(),
                requestData.getPhoneNumber(),
                requestData.getEmail(),
                requestData.getRoles()
            );
        }

        return userMapper.toResponse(savedUserEntity);
    }

    private int countTotalRelatedRecords(User userEntity) {
        int profileCount = userEntity.getProfile() != null ? 1 : 0;
        int employmentCount = userEntity.getEmployment() != null ? 1 : 0;
        int addressCount = userEntity.getAddresses() != null ? userEntity.getAddresses().size() : 0;
        int contactCount = userEntity.getEmergencyContacts() != null ? userEntity.getEmergencyContacts().size() : 0;
        int documentCount = userEntity.getDocuments() != null ? userEntity.getDocuments().size() : 0;
        int educationCount = userEntity.getEducations() != null ? userEntity.getEducations().size() : 0;

        return profileCount + employmentCount + addressCount + contactCount + documentCount + educationCount;
    }

    private void validateUserCreationRequest(UserCreateRequest req) {
        if (userRepository.findByUserIdentifierAndIsDeletedFalse(req.getUserIdentifier()).isPresent()) {
            log.warn("User creation failed - duplicate identifier: identifier={}", req.getUserIdentifier());
            throw new ValidationException("User identifier already exists");
        }

        if (req.getUserType() == UserType.BUSINESS_USER && req.getBusinessId() == null) {
            log.warn("User creation failed - missing business ID");
            throw new ValidationException("Business ID is required for BUSINESS_USER type");
        }

        if (req.getBusinessId() != null) {
            businessRepository.findByIdAndIsDeletedFalse(req.getBusinessId())
                    .orElseThrow(() -> {
                        log.warn("User creation failed - business not found: business_id={}", req.getBusinessId());
                        return new ValidationException("Business not found");
                    });
        }

        List<Role> roles = roleRepository.findByNameInAndIsDeletedFalse(req.getRoles());
        if (roles.size() != req.getRoles().size()) {
            log.warn("User creation failed - invalid roles");
            throw new ValidationException("One or more roles not found");
        }
        validateRoleUserTypeCompatibility(roles, req.getUserType());
    }

    private User buildUserEntity(UserCreateRequest req) {
        User user = userMapper.toEntity(req);
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        List<Role> roles = roleRepository.findByNameInAndIsDeletedFalse(req.getRoles());
        user.setRoles(roles);
        return user;
    }

    private void enrichUserWithProfile(UserCreateRequest requestData, User userEntity) {
        UserProfile userProfileData = userProfileMapper.createFromRequest(requestData, userEntity);
        userEntity.setProfile(userProfileData);
    }

    private void enrichUserWithEmployment(UserCreateRequest requestData, User userEntity) {
        if (hasEmploymentData(requestData)) {
            UserEmployment userEmploymentData = userEmploymentMapper.createFromRequest(requestData, userEntity);
            userEntity.setEmployment(userEmploymentData);
        }
    }

    private void enrichUserWithRelatedEntities(UserCreateRequest requestData, User userEntity) {
        if (requestData.getAddresses() != null && !requestData.getAddresses().isEmpty()) {
            requestData.getAddresses().forEach(addressData ->
                    userEntity.getAddresses().add(userNestedEntitiesMapper.createAddress(addressData, userEntity)));
        }

        if (requestData.getEmergencyContacts() != null && !requestData.getEmergencyContacts().isEmpty()) {
            requestData.getEmergencyContacts().forEach(contactData ->
                    userEntity.getEmergencyContacts().add(userNestedEntitiesMapper.createContact(contactData, userEntity)));
        }

        if (requestData.getDocuments() != null && !requestData.getDocuments().isEmpty()) {
            requestData.getDocuments().forEach(documentData ->
                    userEntity.getDocuments().add(userNestedEntitiesMapper.createDocument(documentData, userEntity)));
        }

        if (requestData.getEducations() != null && !requestData.getEducations().isEmpty()) {
            requestData.getEducations().forEach(educationData ->
                    userEntity.getEducations().add(userNestedEntitiesMapper.createEducation(educationData, userEntity)));
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<UserResponse> getAllUsers(UserFilterRequest filterCriteria) {
        User currentUserContext = securityUtils.getCurrentUser();
        if (currentUserContext.isBusinessUser() && filterCriteria.getBusinessId() == null) {
            filterCriteria.setBusinessId(currentUserContext.getBusinessId());
        }

        Pageable pageableRequest = PaginationUtils.createPageable(
                filterCriteria.getPageNo(), filterCriteria.getPageSize(),
                filterCriteria.getSortBy(), filterCriteria.getSortDirection());

        List<UserType> filterUserTypes = FilterUtils.nullIfEmpty(filterCriteria.getUserTypes());
        List<AccountStatus> filterAccountStatuses = FilterUtils.nullIfEmpty(filterCriteria.getAccountStatuses());
        List<String> filterRoles = FilterUtils.nullIfEmpty(filterCriteria.getRoles());

        Specification<User> spec = UserSpecification.searchUsers(
                filterCriteria.getBusinessId(), filterUserTypes, filterAccountStatuses,
                filterRoles, filterCriteria.getSearch());
        Page<User> userPageData = userRepository.findAll(spec, pageableRequest);

        log.info("Users fetched successfully: count={}, page={}/{}, business_id={}, requested_by={}",
                userPageData.getNumberOfElements(), userPageData.getNumber() + 1, userPageData.getTotalPages(),
                filterCriteria.getBusinessId(), currentUserContext.getId());

        List<UserResponse> content = userPageData.getContent().stream()
                .map(userMapper::toResponse)
                .toList();

        return paginationMapper.toPaginationResponse(userPageData, content);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetailResponse getUserById(UUID userEntityId) {
        UserDetailResponse userDetailsResponse = userMapper.toDetailResponse(
                userRepository.findByIdAndIsDeletedFalse(userEntityId)
                .orElseThrow(() -> {
                    log.warn("User not found: id={}", userEntityId);
                    return new ValidationException("User not found");
                }));

        log.info("User details retrieved successfully: id={}, type={}", userEntityId,
                userDetailsResponse.getUserType() != null ? userDetailsResponse.getUserType() : "UNKNOWN");

        return userDetailsResponse;
    }

    @Override
    public UserResponse updateUser(UUID userEntityId, UserUpdateRequest updateRequestData) {
        log.info("User update initiated: id={}, modified_by={}", userEntityId, securityUtils.getCurrentUserId());

        User userEntity = userRepository.findByIdAndIsDeletedFalse(userEntityId)
                .orElseThrow(() -> {
                    log.warn("User not found for update: id={}", userEntityId);
                    return new ValidationException("User not found");
                });

        updateBusinessAssignment(userEntity, updateRequestData);
        updateUserRoles(userEntity, updateRequestData);
        updateUserProfile(userEntity, updateRequestData);
        updateUserEmployment(userEntity, updateRequestData);
        updateUserRelatedEntities(userEntity, updateRequestData);

        User updatedUserEntity = userRepository.save(userEntity);
        log.info("User updated successfully: id={}, identifier={}, total_changes={}",
                updatedUserEntity.getId(), updatedUserEntity.getUserIdentifier(),
                countTotalRelatedRecords(updatedUserEntity));
        webSocketNotificationService.notifyPlatformEvent("USER_CHANGED", Map.of("action", "updated", "userId", updatedUserEntity.getId().toString()));

        return userMapper.toResponse(updatedUserEntity);
    }

    private void updateBusinessAssignment(User userEntity, UserUpdateRequest updateRequestData) {
        if (updateRequestData.getBusinessId() != null &&
                !updateRequestData.getBusinessId().equals(userEntity.getBusinessId())) {

            businessRepository.findByIdAndIsDeletedFalse(updateRequestData.getBusinessId())
                    .orElseThrow(() -> {
                        log.warn("Business assignment failed: business_id={}, user_id={}",
                                updateRequestData.getBusinessId(), userEntity.getId());
                        return new ValidationException("Business not found");
                    });

            userEntity.setBusinessId(updateRequestData.getBusinessId());
        }
    }

    private void updateUserRoles(User userEntity, UserUpdateRequest updateRequestData) {
        if (updateRequestData.getRoles() != null && !updateRequestData.getRoles().isEmpty()) {
            List<Role> assignedRoles = roleRepository.findByNameInAndIsDeletedFalse(updateRequestData.getRoles());

            if (assignedRoles.size() != updateRequestData.getRoles().size()) {
                log.warn("Role assignment failed - invalid roles: invalid_roles={}, user_id={}",
                        updateRequestData.getRoles(), userEntity.getId());
                throw new ValidationException("One or more roles not found");
            }

            validateRoleUserTypeCompatibility(assignedRoles, userEntity.getUserType());
            userEntity.getRoles().clear();
            userEntity.getRoles().addAll(assignedRoles);
        }
    }

    private void updateUserProfile(User userEntity, UserUpdateRequest updateRequestData) {
        userMapper.updateEntity(updateRequestData, userEntity);

        UserProfile userProfileEntity = userEntity.getProfile();
        if (userProfileEntity == null) {
            userProfileEntity = new UserProfile();
            userProfileEntity.setUser(userEntity);
            userEntity.setProfile(userProfileEntity);
        }
        userProfileMapper.updateFromRequest(updateRequestData, userProfileEntity);
    }

    private void updateUserEmployment(User userEntity, UserUpdateRequest updateRequestData) {
        if (hasEmploymentUpdateData(updateRequestData)) {
            UserEmployment userEmploymentEntity = userEntity.getEmployment();
            if (userEmploymentEntity == null) {
                userEmploymentEntity = new UserEmployment();
                userEmploymentEntity.setUser(userEntity);
                userEntity.setEmployment(userEmploymentEntity);
            }
            userEmploymentMapper.updateFromRequest(updateRequestData, userEmploymentEntity);
        }
    }

    private void updateUserRelatedEntities(User userEntity, UserUpdateRequest updateRequestData) {
        if (updateRequestData.getAddresses() != null) {
            syncEntityCollection(updateRequestData.getAddresses(), userEntity.getAddresses(),
                    AddressRequest::getId,
                    (requestItem, existingItem) -> userNestedEntitiesMapper.updateAddress(requestItem, existingItem),
                    requestItem -> userNestedEntitiesMapper.createAddress(requestItem, userEntity));
        }

        if (updateRequestData.getEmergencyContacts() != null) {
            syncEntityCollection(updateRequestData.getEmergencyContacts(), userEntity.getEmergencyContacts(),
                    EmergencyContactRequest::getId,
                    (requestItem, existingItem) -> userNestedEntitiesMapper.updateContact(requestItem, existingItem),
                    requestItem -> userNestedEntitiesMapper.createContact(requestItem, userEntity));
        }

        if (updateRequestData.getDocuments() != null) {
            syncEntityCollection(updateRequestData.getDocuments(), userEntity.getDocuments(),
                    DocumentRequest::getId,
                    (requestItem, existingItem) -> userNestedEntitiesMapper.updateDocument(requestItem, existingItem),
                    requestItem -> userNestedEntitiesMapper.createDocument(requestItem, userEntity));
        }

        if (updateRequestData.getEducations() != null) {
            syncEntityCollection(updateRequestData.getEducations(), userEntity.getEducations(),
                    EducationRequest::getId,
                    (requestItem, existingItem) -> userNestedEntitiesMapper.updateEducation(requestItem, existingItem),
                    requestItem -> userNestedEntitiesMapper.createEducation(requestItem, userEntity));
        }
    }

    @Override
    public UserResponse deleteUser(UUID userEntityId) {
        log.info("User deletion initiated: id={}, requested_by={}", userEntityId, securityUtils.getCurrentUserId());

        User userEntity = userRepository.findByIdAndIsDeletedFalse(userEntityId)
                .orElseThrow(() -> {
                    log.warn("User not found for deletion: id={}", userEntityId);
                    return new ValidationException("User not found");
                });

        User currentUserContext = securityUtils.getCurrentUser();
        if (userEntity.getId().equals(currentUserContext.getId())) {
            log.warn("User deletion failed - self delete attempt: id={}, username={}", userEntityId, userEntity.getUserIdentifier());
            throw new ValidationException("You cannot delete your own account");
        }

        userEntity.softDelete();
        userRepository.save(userEntity);
        log.info("User deleted successfully: id={}, identifier={}", userEntity.getId(), userEntity.getUserIdentifier());
        webSocketNotificationService.notifyPlatformEvent("USER_CHANGED", Map.of("action", "deleted", "userId", userEntity.getId().toString()));

        return userMapper.toResponse(userEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetailResponse getCurrentUser() {
        User currentUserContext = securityUtils.getCurrentUser();
        log.info("Current user retrieved successfully: id={}", currentUserContext.getId());
        return userMapper.toDetailResponse(currentUserContext);
    }

    @Override
    @Transactional
    public UserDetailResponse updateCurrentUserDetail(UserUpdateRequest profileUpdateRequest) {
        User currentUserContext = securityUtils.getCurrentUser();
        log.info("Current user full profile update initiated: id={}", currentUserContext.getId());
        updateUser(currentUserContext.getId(), profileUpdateRequest);
        return userMapper.toDetailResponse(securityUtils.getCurrentUser());
    }

    @Override
    public CustomerUserResponse getCustomerProfile() {
        User currentUserContext = securityUtils.getCurrentUser();
        log.info("Customer profile retrieved: id={}", currentUserContext.getId());
        return userMapper.toCustomerResponse(currentUserContext);
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUser(UserUpdateRequest profileUpdateRequest) {
        User currentUserContext = securityUtils.getCurrentUser();
        log.info("Current user profile update initiated: id={}", currentUserContext.getId());
        return updateUser(currentUserContext.getId(), profileUpdateRequest);
    }

    @Override
    @Transactional
    public CustomerUserResponse updateCustomerProfile(UserUpdateRequest profileUpdateRequest) {
        User currentUserContext = securityUtils.getCurrentUser();
        log.info("Customer profile update initiated: id={}", currentUserContext.getId());
        updateUser(currentUserContext.getId(), profileUpdateRequest);
        return userMapper.toCustomerResponse(securityUtils.getCurrentUser());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCustomerTypeProfile() {
        User currentUserContext = securityUtils.getCurrentUser();
        if (currentUserContext.getUserType() != UserType.CUSTOMER) {
            throw new ValidationException("This endpoint is only accessible to CUSTOMER users.");
        }
        log.info("Customer-type profile retrieved: id={}", currentUserContext.getId());
        return userMapper.toResponse(currentUserContext);
    }

    @Override
    @Transactional
    public UserResponse updateCustomerTypeProfile(UserUpdateRequest profileUpdateRequest) {
        User currentUserContext = securityUtils.getCurrentUser();
        if (currentUserContext.getUserType() != UserType.CUSTOMER) {
            throw new ValidationException("This endpoint is only accessible to CUSTOMER users.");
        }
        log.info("Customer-type profile update initiated: id={}", currentUserContext.getId());
        return updateUser(currentUserContext.getId(), profileUpdateRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getPlatformUserProfile() {
        User currentUserContext = securityUtils.getCurrentUser();
        if (currentUserContext.getUserType() != UserType.PLATFORM_USER) {
            throw new ValidationException("This endpoint is only accessible to PLATFORM_USER users.");
        }
        log.info("Platform user profile retrieved: id={}", currentUserContext.getId());
        return userMapper.toResponse(currentUserContext);
    }

    @Override
    @Transactional
    public UserResponse updatePlatformUserProfile(UserUpdateRequest profileUpdateRequest) {
        User currentUserContext = securityUtils.getCurrentUser();
        if (currentUserContext.getUserType() != UserType.PLATFORM_USER) {
            throw new ValidationException("This endpoint is only accessible to PLATFORM_USER users.");
        }
        log.info("Platform user profile update initiated: id={}", currentUserContext.getId());
        return updateUser(currentUserContext.getId(), profileUpdateRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetailResponse getBusinessUserProfile() {
        User currentUserContext = securityUtils.getCurrentUser();
        if (currentUserContext.getUserType() != UserType.BUSINESS_USER) {
            throw new ValidationException("This endpoint is only accessible to BUSINESS_USER users.");
        }
        log.info("Business user profile retrieved: id={}", currentUserContext.getId());
        return userMapper.toDetailResponse(currentUserContext);
    }

    @Override
    @Transactional
    public UserDetailResponse updateBusinessUserProfile(UserUpdateRequest profileUpdateRequest) {
        User currentUserContext = securityUtils.getCurrentUser();
        if (currentUserContext.getUserType() != UserType.BUSINESS_USER) {
            throw new ValidationException("This endpoint is only accessible to BUSINESS_USER users.");
        }
        log.info("Business user profile update initiated: id={}", currentUserContext.getId());
        updateUser(currentUserContext.getId(), profileUpdateRequest);
        return userMapper.toDetailResponse(securityUtils.getCurrentUser());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void validateRoleUserTypeCompatibility(List<Role> assignedRoles, UserType userType) {
        assignedRoles.forEach(roleAssignment -> {
            if (!roleAssignment.isCompatibleWithUserType(userType)) {
                log.warn("Incompatible role assignment: role={}, type={}", roleAssignment.getName(), userType);
                throw new ValidationException(String.format(
                        "Role '%s' is not compatible with user type '%s'.", roleAssignment.getName(), userType));
            }
        });
    }

    private boolean hasEmploymentData(UserCreateRequest creationRequest) {
        return creationRequest.getEmployeeId() != null ||
                creationRequest.getPosition() != null ||
                creationRequest.getDepartment() != null ||
                creationRequest.getEmploymentType() != null ||
                creationRequest.getJoinDate() != null ||
                creationRequest.getShift() != null;
    }

    private boolean hasEmploymentUpdateData(UserUpdateRequest updateRequest) {
        return updateRequest.getEmployeeId() != null ||
                updateRequest.getPosition() != null ||
                updateRequest.getDepartment() != null ||
                updateRequest.getEmploymentType() != null ||
                updateRequest.getJoinDate() != null ||
                updateRequest.getShift() != null;
    }

    private <RequestItem, EntityItem extends BaseUUIDEntity> void syncEntityCollection(
            List<RequestItem> requestDataList,
            List<EntityItem> existingEntityList,
            Function<RequestItem, UUID> extractEntityId,
            BiConsumer<RequestItem, EntityItem> updateEntityOperation,
            Function<RequestItem, EntityItem> createEntityOperation) {

        if (requestDataList.isEmpty()) {
            existingEntityList.clear();
            return;
        }

        Map<UUID, EntityItem> existingEntityMap = existingEntityList.stream()
                .filter(entity -> entity.getId() != null)
                .collect(Collectors.toMap(BaseUUIDEntity::getId, Function.identity()));

        Set<UUID> requestedEntityIds = requestDataList.stream()
                .map(extractEntityId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        existingEntityList.removeIf(entity -> !requestedEntityIds.contains(entity.getId()));

        for (RequestItem requestData : requestDataList) {
            UUID requestedEntityId = extractEntityId.apply(requestData);

            if (requestedEntityId != null && existingEntityMap.containsKey(requestedEntityId)) {
                EntityItem existingEntity = existingEntityMap.get(requestedEntityId);
                updateEntityOperation.accept(requestData, existingEntity);
            } else if (requestedEntityId == null) {
                EntityItem newEntity = createEntityOperation.apply(requestData);
                existingEntityList.add(newEntity);
            }
        }
    }

}
