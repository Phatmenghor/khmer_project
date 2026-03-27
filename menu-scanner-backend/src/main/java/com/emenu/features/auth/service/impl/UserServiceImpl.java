package com.emenu.features.auth.service.impl;

import com.emenu.enums.user.AccountStatus;
import com.emenu.enums.user.UserType;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.dto.filter.UserFilterRequest;
import com.emenu.features.auth.dto.request.*;
import com.emenu.features.auth.dto.response.UserResponse;
import com.emenu.features.auth.dto.update.UserUpdateRequest;
import com.emenu.features.auth.mapper.UserMapper;
import com.emenu.features.auth.models.*;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.auth.repository.RoleRepository;
import com.emenu.features.auth.repository.UserRepository;
import com.emenu.features.auth.service.BusinessService;
import com.emenu.features.auth.service.UserService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.pagination.PaginationUtils;
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

        // Profile
        UserProfile profile = new UserProfile();
        profile.setUser(saved);
        profile.setEmail(req.getEmail());
        profile.setFirstName(req.getFirstName());
        profile.setLastName(req.getLastName());
        profile.setNickname(req.getNickname());
        profile.setGender(req.getGender());
        profile.setDateOfBirth(req.getDateOfBirth());
        profile.setPhoneNumber(req.getPhoneNumber());
        profile.setProfileImageUrl(req.getProfileImageUrl());
        saved.setProfile(profile);

        // Employment
        if (hasEmploymentData(req)) {
            UserEmployment emp = new UserEmployment();
            emp.setUser(saved);
            emp.setEmployeeId(req.getEmployeeId());
            emp.setPosition(req.getPosition());
            emp.setDepartment(req.getDepartment());
            emp.setEmploymentType(req.getEmploymentType());
            emp.setJoinDate(req.getJoinDate());
            emp.setLeaveDate(req.getLeaveDate());
            emp.setShift(req.getShift());
            saved.setEmployment(emp);
        }

        // Use a final reference for use inside lambdas (saved is reassigned below)
        final User savedRef = saved;

        // Addresses
        if (req.getAddresses() != null) {
            req.getAddresses().forEach(r -> savedRef.getAddresses().add(buildAddress(r, savedRef)));
        }

        // Emergency contacts
        if (req.getEmergencyContacts() != null) {
            req.getEmergencyContacts().forEach(r -> savedRef.getEmergencyContacts().add(buildContact(r, savedRef)));
        }

        // Documents
        if (req.getDocuments() != null) {
            req.getDocuments().forEach(r -> savedRef.getDocuments().add(buildDocument(r, savedRef)));
        }

        // Educations
        if (req.getEducations() != null) {
            req.getEducations().forEach(r -> savedRef.getEducations().add(buildEducation(r, savedRef)));
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

        List<UserType> userTypes = nullIfEmpty(request.getUserTypes());
        List<AccountStatus> accountStatuses = nullIfEmpty(request.getAccountStatuses());
        List<String> roles = nullIfEmpty(request.getRoles());

        Page<User> page = userRepository.searchUsers(
                request.getBusinessId(), userTypes, accountStatuses, roles, request.getSearch(), pageable);
        return userMapper.toPaginationResponse(page, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID userId) {
        return userMapper.toResponse(userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new RuntimeException("User not found")));
    }

    @Override
    public UserResponse updateUser(UUID userId, UserUpdateRequest req) {
        log.info("Updating user: {}", userId);
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

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

        // Profile
        UserProfile profile = user.getProfile();
        if (profile == null) { profile = new UserProfile(); profile.setUser(user); user.setProfile(profile); }
        if (req.getEmail() != null) profile.setEmail(req.getEmail());
        if (req.getFirstName() != null) profile.setFirstName(req.getFirstName());
        if (req.getLastName() != null) profile.setLastName(req.getLastName());
        if (req.getNickname() != null) profile.setNickname(req.getNickname());
        if (req.getGender() != null) profile.setGender(req.getGender());
        if (req.getDateOfBirth() != null) profile.setDateOfBirth(req.getDateOfBirth());
        if (req.getPhoneNumber() != null) profile.setPhoneNumber(req.getPhoneNumber());
        if (req.getProfileImageUrl() != null) profile.setProfileImageUrl(req.getProfileImageUrl());

        // Employment
        if (hasEmploymentUpdateData(req)) {
            UserEmployment emp = user.getEmployment();
            if (emp == null) { emp = new UserEmployment(); emp.setUser(user); user.setEmployment(emp); }
            if (req.getEmployeeId() != null) emp.setEmployeeId(req.getEmployeeId());
            if (req.getPosition() != null) emp.setPosition(req.getPosition());
            if (req.getDepartment() != null) emp.setDepartment(req.getDepartment());
            if (req.getEmploymentType() != null) emp.setEmploymentType(req.getEmploymentType());
            if (req.getJoinDate() != null) emp.setJoinDate(req.getJoinDate());
            if (req.getLeaveDate() != null) emp.setLeaveDate(req.getLeaveDate());
            if (req.getShift() != null) emp.setShift(req.getShift());
        }

        // null = no change | [] = remove all | items = merge (update by id / create new / delete missing)
        if (req.getAddresses() != null) mergeList(req.getAddresses(), user.getAddresses(),
                AddressRequest::getId, this::applyAddressFields, r -> buildAddress(r, user));
        if (req.getEmergencyContacts() != null) mergeList(req.getEmergencyContacts(), user.getEmergencyContacts(),
                EmergencyContactRequest::getId, this::applyContactFields, r -> buildContact(r, user));
        if (req.getDocuments() != null) mergeList(req.getDocuments(), user.getDocuments(),
                DocumentRequest::getId, this::applyDocumentFields, r -> buildDocument(r, user));
        if (req.getEducations() != null) mergeList(req.getEducations(), user.getEducations(),
                EducationRequest::getId, this::applyEducationFields, r -> buildEducation(r, user));

        User updated = userRepository.save(user);
        log.info("User updated: {}", updated.getUserIdentifier());
        return userMapper.toResponse(updated);
    }

    @Override
    public UserResponse deleteUser(UUID userId) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getId().equals(securityUtils.getCurrentUser().getId())) {
            throw new ValidationException("You cannot delete your own account");
        }
        user.softDelete();
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        return userMapper.toResponse(securityUtils.getCurrentUser());
    }

    @Override
    public UserResponse updateCurrentUser(UserUpdateRequest request) {
        User user = securityUtils.getCurrentUser();
        userMapper.updateEntity(request, user);
        return userMapper.toResponse(userRepository.save(user));
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

    private <T> List<T> nullIfEmpty(List<T> list) {
        return (list != null && !list.isEmpty()) ? list : null;
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

    private UserAddress buildAddress(AddressRequest req, User user) {
        UserAddress a = new UserAddress();
        a.setUser(user);
        applyAddressFields(req, a);
        return a;
    }

    private void applyAddressFields(AddressRequest req, UserAddress a) {
        if (req.getAddressType() != null) a.setAddressType(req.getAddressType());
        if (req.getHouseNo() != null) a.setHouseNo(req.getHouseNo());
        if (req.getStreet() != null) a.setStreet(req.getStreet());
        if (req.getVillage() != null) a.setVillage(req.getVillage());
        if (req.getCommune() != null) a.setCommune(req.getCommune());
        if (req.getDistrict() != null) a.setDistrict(req.getDistrict());
        if (req.getProvince() != null) a.setProvince(req.getProvince());
        if (req.getCountry() != null) a.setCountry(req.getCountry());
    }

    private UserEmergencyContact buildContact(EmergencyContactRequest req, User user) {
        UserEmergencyContact c = new UserEmergencyContact();
        c.setUser(user);
        applyContactFields(req, c);
        return c;
    }

    private void applyContactFields(EmergencyContactRequest req, UserEmergencyContact c) {
        if (req.getName() != null) c.setName(req.getName());
        if (req.getPhone() != null) c.setPhone(req.getPhone());
        if (req.getRelationship() != null) c.setRelationship(req.getRelationship());
    }

    private UserDocument buildDocument(DocumentRequest req, User user) {
        UserDocument d = new UserDocument();
        d.setUser(user);
        applyDocumentFields(req, d);
        return d;
    }

    private void applyDocumentFields(DocumentRequest req, UserDocument d) {
        if (req.getType() != null) d.setType(req.getType());
        if (req.getNumber() != null) d.setNumber(req.getNumber());
        if (req.getFileUrl() != null) d.setFileUrl(req.getFileUrl());
    }

    private UserEducation buildEducation(EducationRequest req, User user) {
        UserEducation e = new UserEducation();
        e.setUser(user);
        applyEducationFields(req, e);
        return e;
    }

    private void applyEducationFields(EducationRequest req, UserEducation e) {
        if (req.getLevel() != null) e.setLevel(req.getLevel());
        if (req.getSchoolName() != null) e.setSchoolName(req.getSchoolName());
        if (req.getFieldOfStudy() != null) e.setFieldOfStudy(req.getFieldOfStudy());
        if (req.getStartYear() != null) e.setStartYear(req.getStartYear());
        if (req.getEndYear() != null) e.setEndYear(req.getEndYear());
        if (req.getIsGraduated() != null) e.setIsGraduated(req.getIsGraduated());
        if (req.getCertificateUrl() != null) e.setCertificateUrl(req.getCertificateUrl());
    }
}
