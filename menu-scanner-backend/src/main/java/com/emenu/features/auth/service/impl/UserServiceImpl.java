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
import java.util.UUID;

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
    public UserResponse createUser(UserCreateRequest request) {
        log.info("Creating user: {}", request.getUserIdentifier());

        if (userRepository.existsByUserIdentifierAndIsDeletedFalse(request.getUserIdentifier())) {
            throw new ValidationException("User identifier already exists");
        }

        if (request.getUserType() == UserType.BUSINESS_USER && request.getBusinessId() == null) {
            throw new ValidationException("Business ID is required for BUSINESS_USER type");
        }

        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        if (request.getBusinessId() != null) {
            businessRepository.findByIdAndIsDeletedFalse(request.getBusinessId())
                    .orElseThrow(() -> new ValidationException("Business not found"));
            user.setBusinessId(request.getBusinessId());
        }

        List<Role> roles = roleRepository.findByNameInAndIsDeletedFalse(request.getRoles());
        if (roles.size() != request.getRoles().size()) {
            throw new ValidationException("One or more roles not found");
        }
        validateRoleUserTypeCompatibility(roles, request.getUserType());
        user.setRoles(roles);

        // Persist user first so nested entities get a valid user reference
        User savedUser = userRepository.save(user);

        // Address
        if (request.getAddress() != null) {
            UserAddress address = buildAddress(request.getAddress(), savedUser);
            savedUser.setUserAddress(address);
        }

        // Emergency contacts
        if (request.getEmergencyContacts() != null) {
            request.getEmergencyContacts().forEach(r -> savedUser.getEmergencyContacts().add(buildContact(r, savedUser)));
        }

        // Documents
        if (request.getDocuments() != null) {
            request.getDocuments().forEach(r -> savedUser.getDocuments().add(buildDocument(r, savedUser)));
        }

        // Educations
        if (request.getEducations() != null) {
            request.getEducations().forEach(r -> savedUser.getEducations().add(buildEducation(r, savedUser)));
        }

        savedUser = userRepository.save(savedUser);
        log.info("User created: {} type={} roles={}", savedUser.getUserIdentifier(), savedUser.getUserType(), request.getRoles());
        return userMapper.toResponse(savedUser);
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

        List<UserType> userTypes = (request.getUserTypes() != null && !request.getUserTypes().isEmpty()) ? request.getUserTypes() : null;
        List<AccountStatus> accountStatuses = (request.getAccountStatuses() != null && !request.getAccountStatuses().isEmpty()) ? request.getAccountStatuses() : null;
        List<String> roles = (request.getRoles() != null && !request.getRoles().isEmpty()) ? request.getRoles() : null;

        Page<User> userPage = userRepository.searchUsers(
                request.getBusinessId(), userTypes, accountStatuses, roles, request.getSearch(), pageable);

        return userMapper.toPaginationResponse(userPage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID userId) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse updateUser(UUID userId, UserUpdateRequest request) {
        log.info("Updating user: {}", userId);

        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getBusinessId() != null && !request.getBusinessId().equals(user.getBusinessId())) {
            businessRepository.findByIdAndIsDeletedFalse(request.getBusinessId())
                    .orElseThrow(() -> new ValidationException("Business not found"));
            user.setBusinessId(request.getBusinessId());
        }

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            List<Role> roles = roleRepository.findByNameInAndIsDeletedFalse(request.getRoles());
            if (roles.size() != request.getRoles().size()) throw new ValidationException("One or more roles not found");
            validateRoleUserTypeCompatibility(roles, user.getUserType());
            user.getRoles().clear();
            user.getRoles().addAll(roles);
        }

        userMapper.updateEntity(request, user);

        // Address
        if (request.getAddress() != null) {
            if (user.getUserAddress() == null) {
                user.setUserAddress(buildAddress(request.getAddress(), user));
            } else {
                applyAddress(request.getAddress(), user.getUserAddress());
            }
        }

        // Emergency contacts — full replace if provided
        if (request.getEmergencyContacts() != null) {
            user.getEmergencyContacts().clear();
            request.getEmergencyContacts().forEach(r -> user.getEmergencyContacts().add(buildContact(r, user)));
        }

        // Documents — full replace if provided
        if (request.getDocuments() != null) {
            user.getDocuments().clear();
            request.getDocuments().forEach(r -> user.getDocuments().add(buildDocument(r, user)));
        }

        // Educations — full replace if provided
        if (request.getEducations() != null) {
            user.getEducations().clear();
            request.getEducations().forEach(r -> user.getEducations().add(buildEducation(r, user)));
        }

        User updatedUser = userRepository.save(user);
        log.info("User updated: {}", updatedUser.getUserIdentifier());
        return userMapper.toResponse(updatedUser);
    }

    @Override
    public UserResponse deleteUser(UUID userId) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User currentUser = securityUtils.getCurrentUser();
        if (user.getId().equals(currentUser.getId())) {
            throw new ValidationException("You cannot delete your own account");
        }

        user.softDelete();
        user = userRepository.save(user);
        log.info("User deleted: {}", user.getUserIdentifier());
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        return userMapper.toResponse(securityUtils.getCurrentUser());
    }

    @Override
    public UserResponse updateCurrentUser(UserUpdateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        userMapper.updateEntity(request, currentUser);
        User updatedUser = userRepository.save(currentUser);
        log.info("Current user updated: {}", updatedUser.getUserIdentifier());
        return userMapper.toResponse(updatedUser);
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private void validateRoleUserTypeCompatibility(List<Role> roles, UserType userType) {
        for (Role role : roles) {
            if (!role.isCompatibleWithUserType(userType)) {
                throw new ValidationException(String.format(
                        "Role '%s' is not compatible with user type '%s'. This role is for '%s' users.",
                        role.getName(), userType, role.getUserType()));
            }
        }
    }

    private UserAddress buildAddress(AddressRequest req, User user) {
        UserAddress a = new UserAddress();
        a.setUser(user);
        applyAddress(req, a);
        return a;
    }

    private void applyAddress(AddressRequest req, UserAddress a) {
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
        c.setName(req.getName());
        c.setPhone(req.getPhone());
        c.setRelationship(req.getRelationship());
        return c;
    }

    private UserDocument buildDocument(DocumentRequest req, User user) {
        UserDocument d = new UserDocument();
        d.setUser(user);
        d.setType(req.getType());
        d.setNumber(req.getNumber());
        d.setFileUrl(req.getFileUrl());
        return d;
    }

    private UserEducation buildEducation(EducationRequest req, User user) {
        UserEducation e = new UserEducation();
        e.setUser(user);
        e.setLevel(req.getLevel());
        e.setSchoolName(req.getSchoolName());
        e.setFieldOfStudy(req.getFieldOfStudy());
        e.setStartYear(req.getStartYear());
        e.setEndYear(req.getEndYear());
        e.setIsGraduated(req.getIsGraduated());
        e.setCertificateUrl(req.getCertificateUrl());
        return e;
    }
}
