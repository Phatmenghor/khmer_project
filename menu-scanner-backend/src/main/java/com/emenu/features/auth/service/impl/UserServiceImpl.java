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
        log.info("Creating user: {}", req.getUserIdentifier());

        if (userRepository.existsByUserIdentifierAndIsDeletedFalse(req.getUserIdentifier())) {
            throw new ValidationException("User identifier already exists");
        }
        if (req.getUserType() == UserType.BUSINESS_USER && req.getBusinessId() == null) {
            throw new ValidationException("Business ID is required for BUSINESS_USER type");
        }
        if (req.getBusinessId() != null) {
            businessRepository.findByIdAndIsDeletedFalse(req.getBusinessId())
                    .orElseThrow(() -> new ValidationException("Business not found"));
        }

        List<Role> roles = roleRepository.findByNameInAndIsDeletedFalse(req.getRoles());
        if (roles.size() != req.getRoles().size()) throw new ValidationException("One or more roles not found");
        validateRoleUserTypeCompatibility(roles, req.getUserType());

        User user = userMapper.toEntity(req);
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRoles(roles);
        User saved = userRepository.save(user);

        UserProfile profile = userProfileMapper.createFromRequest(req, saved);
        saved.setProfile(profile);

        if (hasEmploymentData(req)) {
            UserEmployment emp = userEmploymentMapper.createFromRequest(req, saved);
            saved.setEmployment(emp);
        }

        // Use a final reference for use inside lambdas (saved is reassigned below)
        final User savedRef = saved;

        if (req.getAddresses() != null) {
            req.getAddresses().forEach(r -> savedRef.getAddresses().add(userNestedEntitiesMapper.createAddress(r, savedRef)));
        }

        if (req.getEmergencyContacts() != null) {
            req.getEmergencyContacts().forEach(r -> savedRef.getEmergencyContacts().add(userNestedEntitiesMapper.createContact(r, savedRef)));
        }

        if (req.getDocuments() != null) {
            req.getDocuments().forEach(r -> savedRef.getDocuments().add(userNestedEntitiesMapper.createDocument(r, savedRef)));
        }

        if (req.getEducations() != null) {
            req.getEducations().forEach(r -> savedRef.getEducations().add(userNestedEntitiesMapper.createEducation(r, savedRef)));
        }

        saved = userRepository.save(savedRef);
        log.info("User created: {} type={}", saved.getUserIdentifier(), saved.getUserType());
        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<UserResponse> getAllUsers(UserFilterRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.isBusinessUser() && request.getBusinessId() == null) {
            request.setBusinessId(currentUser.getBusinessId());
        }
        Pageable pageable = PaginationUtils.createPageable(
                request.getPageNo(), request.getPageSize(), request.getSortBy(), request.getSortDirection());

        List<UserType> userTypes = FilterUtils.nullIfEmpty(request.getUserTypes());
        List<AccountStatus> accountStatuses = FilterUtils.nullIfEmpty(request.getAccountStatuses());
        List<String> roles = FilterUtils.nullIfEmpty(request.getRoles());

        Page<User> page = userRepository.searchUsers(
                request.getBusinessId(), userTypes, accountStatuses, roles, request.getSearch(), pageable);
        return userMapper.toPaginationResponse(page, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetailResponse getUserById(UUID userId) {
        return userMapper.toDetailResponse(userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new ValidationException("User not found")));
    }

    @Override
    public UserResponse updateUser(UUID userId, UserUpdateRequest req) {
        log.info("Updating user: {}", userId);
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new ValidationException("User not found"));

        if (req.getBusinessId() != null && !req.getBusinessId().equals(user.getBusinessId())) {
            businessRepository.findByIdAndIsDeletedFalse(req.getBusinessId())
                    .orElseThrow(() -> new ValidationException("Business not found"));
            user.setBusinessId(req.getBusinessId());
        }

        if (req.getRoles() != null && !req.getRoles().isEmpty()) {
            List<Role> roles = roleRepository.findByNameInAndIsDeletedFalse(req.getRoles());
            if (roles.size() != req.getRoles().size()) throw new ValidationException("One or more roles not found");
            validateRoleUserTypeCompatibility(roles, user.getUserType());
            user.getRoles().clear();
            user.getRoles().addAll(roles);
        }

        userMapper.updateEntity(req, user);

        UserProfile profile = user.getProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
            user.setProfile(profile);
        }
        userProfileMapper.updateFromRequest(req, profile);

        if (hasEmploymentUpdateData(req)) {
            UserEmployment emp = user.getEmployment();
            if (emp == null) {
                emp = new UserEmployment();
                emp.setUser(user);
                user.setEmployment(emp);
            }
            userEmploymentMapper.updateFromRequest(req, emp);
        }

        if (req.getAddresses() != null) mergeList(req.getAddresses(), user.getAddresses(),
                AddressRequest::getId, userNestedEntitiesMapper::updateAddress, r -> userNestedEntitiesMapper.createAddress(r, user));
        if (req.getEmergencyContacts() != null) mergeList(req.getEmergencyContacts(), user.getEmergencyContacts(),
                EmergencyContactRequest::getId, userNestedEntitiesMapper::updateContact, r -> userNestedEntitiesMapper.createContact(r, user));
        if (req.getDocuments() != null) mergeList(req.getDocuments(), user.getDocuments(),
                DocumentRequest::getId, userNestedEntitiesMapper::updateDocument, r -> userNestedEntitiesMapper.createDocument(r, user));
        if (req.getEducations() != null) mergeList(req.getEducations(), user.getEducations(),
                EducationRequest::getId, userNestedEntitiesMapper::updateEducation, r -> userNestedEntitiesMapper.createEducation(r, user));

        User updated = userRepository.save(user);
        log.info("User updated: {}", updated.getUserIdentifier());
        return userMapper.toResponse(updated);
    }

    @Override
    public UserResponse deleteUser(UUID userId) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new ValidationException("User not found"));
        if (user.getId().equals(securityUtils.getCurrentUser().getId())) {
            throw new ValidationException("You cannot delete your own account");
        }
        user.softDelete();
        log.info("User deleted: {}", user.getUserIdentifier());
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        return userMapper.toResponse(securityUtils.getCurrentUser());
    }

    /**
     * Updates the current authenticated user's profile.
     * Convenience method that extracts the current user ID and calls updateUser.
     */
    @Override
    @Transactional
    public UserResponse updateCurrentUser(UserUpdateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
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
