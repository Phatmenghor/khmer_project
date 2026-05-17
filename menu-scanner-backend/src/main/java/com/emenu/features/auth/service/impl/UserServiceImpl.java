package com.emenu.features.auth.service.impl;

import com.emenu.enums.user.AccountStatus;
import com.emenu.enums.user.UserType;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.dto.filter.UserFilterRequest;
import com.emenu.features.auth.dto.request.*;
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
import com.emenu.features.auth.service.BusinessService;
import com.emenu.features.auth.service.UserService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.pagination.PaginationUtils;
import com.emenu.shared.utils.FilterUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
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
    private final com.emenu.shared.mapper.PaginationMapper paginationMapper;

    @Override
    public UserResponse createUser(UserCreateRequest req) {
        log.info("Creating new user: identifier={}, type={}, business={}",
                req.getUserIdentifier(), req.getUserType(), req.getBusinessId());

        validateUserCreationRequest(req);
        log.debug("User creation request validation passed");

        User user = buildUserEntity(req);
        User saved = userRepository.save(user);
        log.debug("User entity persisted: id={}, identifier={}", saved.getId(), saved.getUserIdentifier());

        enrichUserWithProfile(req, saved);
        enrichUserWithEmployment(req, saved);
        enrichUserWithRelatedEntities(req, saved);

        saved = userRepository.save(saved);
        log.info("User created successfully: id={}, identifier={}, type={}",
                saved.getId(), saved.getUserIdentifier(), saved.getUserType());

        return userMapper.toResponse(saved);
    }

    private void validateUserCreationRequest(UserCreateRequest req) {
        if (userRepository.existsByUserIdentifierAndIsDeletedFalse(req.getUserIdentifier())) {
            log.warn("User creation failed - identifier already exists: {}", req.getUserIdentifier());
            throw new ValidationException("User identifier already exists");
        }

        if (req.getUserType() == UserType.BUSINESS_USER && req.getBusinessId() == null) {
            log.warn("User creation failed - BUSINESS_USER requires businessId");
            throw new ValidationException("Business ID is required for BUSINESS_USER type");
        }

        if (req.getBusinessId() != null) {
            businessRepository.findByIdAndIsDeletedFalse(req.getBusinessId())
                    .orElseThrow(() -> {
                        log.warn("User creation failed - business not found: {}", req.getBusinessId());
                        return new ValidationException("Business not found");
                    });
        }

        List<Role> roles = roleRepository.findByNameInAndIsDeletedFalse(req.getRoles());
        if (roles.size() != req.getRoles().size()) {
            log.warn("User creation failed - invalid roles requested");
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

    private void enrichUserWithProfile(UserCreateRequest req, User user) {
        UserProfile profile = userProfileMapper.createFromRequest(req, user);
        user.setProfile(profile);
        log.debug("User profile created for user: {}", user.getId());
    }

    private void enrichUserWithEmployment(UserCreateRequest req, User user) {
        if (hasEmploymentData(req)) {
            UserEmployment emp = userEmploymentMapper.createFromRequest(req, user);
            user.setEmployment(emp);
            log.debug("User employment created for user: {}", user.getId());
        }
    }

    private void enrichUserWithRelatedEntities(UserCreateRequest req, User user) {
        if (req.getAddresses() != null && !req.getAddresses().isEmpty()) {
            req.getAddresses().forEach(r -> user.getAddresses().add(userNestedEntitiesMapper.createAddress(r, user)));
            log.debug("Added {} addresses to user: {}", req.getAddresses().size(), user.getId());
        }

        if (req.getEmergencyContacts() != null && !req.getEmergencyContacts().isEmpty()) {
            req.getEmergencyContacts().forEach(r -> user.getEmergencyContacts().add(userNestedEntitiesMapper.createContact(r, user)));
            log.debug("Added {} emergency contacts to user: {}", req.getEmergencyContacts().size(), user.getId());
        }

        if (req.getDocuments() != null && !req.getDocuments().isEmpty()) {
            req.getDocuments().forEach(r -> user.getDocuments().add(userNestedEntitiesMapper.createDocument(r, user)));
            log.debug("Added {} documents to user: {}", req.getDocuments().size(), user.getId());
        }

        if (req.getEducations() != null && !req.getEducations().isEmpty()) {
            req.getEducations().forEach(r -> user.getEducations().add(userNestedEntitiesMapper.createEducation(r, user)));
            log.debug("Added {} education records to user: {}", req.getEducations().size(), user.getId());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<UserResponse> getAllUsers(UserFilterRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.isBusinessUser() && request.getBusinessId() == null) {
            request.setBusinessId(currentUser.getBusinessId());
        }

        log.debug("Fetching users - business: {}, types: {}, statuses: {}, page: {}/{}",
                request.getBusinessId(), request.getUserTypes(), request.getAccountStatuses(),
                request.getPageNo(), request.getPageSize());

        Pageable pageable = PaginationUtils.createPageable(
                request.getPageNo(), request.getPageSize(), request.getSortBy(), request.getSortDirection());

        List<UserType> userTypes = FilterUtils.nullIfEmpty(request.getUserTypes());
        List<AccountStatus> accountStatuses = FilterUtils.nullIfEmpty(request.getAccountStatuses());
        List<String> roles = FilterUtils.nullIfEmpty(request.getRoles());

        Page<User> page = userRepository.searchUsers(
                request.getBusinessId(), userTypes, accountStatuses, roles, request.getSearch(), pageable);

        log.info("Retrieved {} users (page {}/{})", page.getNumberOfElements(), page.getNumber() + 1, page.getTotalPages());
        return userMapper.toPaginationResponse(page, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetailResponse getUserById(UUID userId) {
        log.debug("Fetching user details: {}", userId);
        UserDetailResponse response = userMapper.toDetailResponse(userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> {
                    log.warn("User not found: {}", userId);
                    return new ValidationException("User not found");
                }));
        log.debug("User details retrieved: {}", userId);
        return response;
    }

    @Override
    public UserResponse updateUser(UUID userId, UserUpdateRequest req) {
        log.info("Updating user: {}", userId);

        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> {
                    log.warn("User update failed - user not found: {}", userId);
                    return new ValidationException("User not found");
                });

        updateBusinessAssignment(user, req);
        updateUserRoles(user, req);
        updateUserProfile(user, req);
        updateUserEmployment(user, req);
        updateUserRelatedEntities(user, req);

        User updated = userRepository.save(user);
        log.info("User updated successfully: id={}, identifier={}", updated.getId(), updated.getUserIdentifier());
        return userMapper.toResponse(updated);
    }

    private void updateBusinessAssignment(User user, UserUpdateRequest req) {
        if (req.getBusinessId() != null && !req.getBusinessId().equals(user.getBusinessId())) {
            businessRepository.findByIdAndIsDeletedFalse(req.getBusinessId())
                    .orElseThrow(() -> {
                        log.warn("Business assignment failed - business not found: {}", req.getBusinessId());
                        return new ValidationException("Business not found");
                    });
            user.setBusinessId(req.getBusinessId());
            log.debug("User business assignment updated: {}", req.getBusinessId());
        }
    }

    private void updateUserRoles(User user, UserUpdateRequest req) {
        if (req.getRoles() != null && !req.getRoles().isEmpty()) {
            List<Role> roles = roleRepository.findByNameInAndIsDeletedFalse(req.getRoles());
            if (roles.size() != req.getRoles().size()) {
                log.warn("Role update failed - invalid roles: {}", req.getRoles());
                throw new ValidationException("One or more roles not found");
            }
            validateRoleUserTypeCompatibility(roles, user.getUserType());
            user.getRoles().clear();
            user.getRoles().addAll(roles);
            log.debug("User roles updated: count={}", roles.size());
        }
    }

    private void updateUserProfile(User user, UserUpdateRequest req) {
        userMapper.updateEntity(req, user);

        UserProfile profile = user.getProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
            user.setProfile(profile);
            log.debug("User profile created");
        }
        userProfileMapper.updateFromRequest(req, profile);
    }

    private void updateUserEmployment(User user, UserUpdateRequest req) {
        if (hasEmploymentUpdateData(req)) {
            UserEmployment emp = user.getEmployment();
            if (emp == null) {
                emp = new UserEmployment();
                emp.setUser(user);
                user.setEmployment(emp);
                log.debug("User employment created");
            }
            userEmploymentMapper.updateFromRequest(req, emp);
        }
    }

    private void updateUserRelatedEntities(User user, UserUpdateRequest req) {
        if (req.getAddresses() != null) {
            mergeList(req.getAddresses(), user.getAddresses(),
                    AddressRequest::getId, userNestedEntitiesMapper::updateAddress, r -> userNestedEntitiesMapper.createAddress(r, user));
            log.debug("User addresses updated: count={}", user.getAddresses().size());
        }

        if (req.getEmergencyContacts() != null) {
            mergeList(req.getEmergencyContacts(), user.getEmergencyContacts(),
                    EmergencyContactRequest::getId, userNestedEntitiesMapper::updateContact, r -> userNestedEntitiesMapper.createContact(r, user));
            log.debug("User emergency contacts updated: count={}", user.getEmergencyContacts().size());
        }

        if (req.getDocuments() != null) {
            mergeList(req.getDocuments(), user.getDocuments(),
                    DocumentRequest::getId, userNestedEntitiesMapper::updateDocument, r -> userNestedEntitiesMapper.createDocument(r, user));
            log.debug("User documents updated: count={}", user.getDocuments().size());
        }

        if (req.getEducations() != null) {
            mergeList(req.getEducations(), user.getEducations(),
                    EducationRequest::getId, userNestedEntitiesMapper::updateEducation, r -> userNestedEntitiesMapper.createEducation(r, user));
            log.debug("User educations updated: count={}", user.getEducations().size());
        }
    }

    @Override
    public UserResponse deleteUser(UUID userId) {
        log.info("Deleting user: {}", userId);

        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> {
                    log.warn("User deletion failed - user not found: {}", userId);
                    return new ValidationException("User not found");
                });

        if (user.getId().equals(securityUtils.getCurrentUser().getId())) {
            log.warn("User deletion failed - attempting to delete own account: {}", userId);
            throw new ValidationException("You cannot delete your own account");
        }

        user.softDelete();
        userRepository.save(user);
        log.info("User deleted successfully: id={}, identifier={}", user.getId(), user.getUserIdentifier());
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        User currentUser = securityUtils.getCurrentUser();
        log.debug("Retrieving current user: {}", currentUser.getId());
        return userMapper.toResponse(currentUser);
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUser(UserUpdateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Updating current user profile: {}", currentUser.getId());
        return updateUser(currentUser.getId(), request);
    }


    // ── Helpers ───────────────────────────────────────────────────────────────

    private void validateRoleUserTypeCompatibility(List<Role> roles, UserType userType) {
        roles.forEach(r -> {
            if (!r.isCompatibleWithUserType(userType)) {
                throw new ValidationException(String.format(
                        "Role '%s' is not compatible with user type '%s'.", r.getName(), userType));
            }
        });
    }

    private boolean hasEmploymentData(UserCreateRequest r) {
        return r.getEmployeeId() != null || r.getPosition() != null || r.getDepartment() != null
                || r.getEmploymentType() != null || r.getJoinDate() != null || r.getShift() != null;
    }

    private boolean hasEmploymentUpdateData(UserUpdateRequest r) {
        return r.getEmployeeId() != null || r.getPosition() != null || r.getDepartment() != null
                || r.getEmploymentType() != null || r.getJoinDate() != null || r.getShift() != null;
    }

    /**
     * Merge a request list into an existing entity collection.
     * - [] → clears all (orphanRemoval deletes)
     * - item with id present in collection → update fields
     * - item with no id → create new
     * - existing item whose id is absent from request list → removed (orphanRemoval deletes)
     */
    private <REQ, ENTITY extends com.emenu.shared.domain.BaseUUIDEntity> void mergeList(
            List<REQ> requests,
            List<ENTITY> existing,
            Function<REQ, UUID> idExtractor,
            java.util.function.BiConsumer<REQ, ENTITY> updater,
            Function<REQ, ENTITY> creator) {

        if (requests.isEmpty()) { existing.clear(); return; }

        Map<UUID, ENTITY> existingById = existing.stream()
                .filter(e -> e.getId() != null)
                .collect(Collectors.toMap(com.emenu.shared.domain.BaseUUIDEntity::getId, Function.identity()));

        Set<UUID> keepIds = requests.stream()
                .map(idExtractor).filter(Objects::nonNull).collect(Collectors.toSet());

        existing.removeIf(e -> !keepIds.contains(e.getId()));

        for (REQ req : requests) {
            UUID id = idExtractor.apply(req);
            if (id != null && existingById.containsKey(id)) {
                updater.accept(req, existingById.get(id));
            } else if (id == null) {
                existing.add(creator.apply(req));
            }
        }
    }

}
