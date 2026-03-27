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

        // Addresses — full replace if provided
        if (req.getAddresses() != null) {
            user.getAddresses().clear();
            req.getAddresses().forEach(r -> user.getAddresses().add(buildAddress(r, user)));
        }
        if (req.getEmergencyContacts() != null) {
            user.getEmergencyContacts().clear();
            req.getEmergencyContacts().forEach(r -> user.getEmergencyContacts().add(buildContact(r, user)));
        }
        if (req.getDocuments() != null) {
            user.getDocuments().clear();
            req.getDocuments().forEach(r -> user.getDocuments().add(buildDocument(r, user)));
        }
        if (req.getEducations() != null) {
            user.getEducations().clear();
            req.getEducations().forEach(r -> user.getEducations().add(buildEducation(r, user)));
        }

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

    private UserAddress buildAddress(AddressRequest req, User user) {
        UserAddress a = new UserAddress();
        a.setUser(user);
        a.setAddressType(req.getAddressType());
        a.setHouseNo(req.getHouseNo());
        a.setStreet(req.getStreet());
        a.setVillage(req.getVillage());
        a.setCommune(req.getCommune());
        a.setDistrict(req.getDistrict());
        a.setProvince(req.getProvince());
        a.setCountry(req.getCountry());
        return a;
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
