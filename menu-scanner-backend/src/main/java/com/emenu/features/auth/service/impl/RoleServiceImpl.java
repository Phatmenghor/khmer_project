package com.emenu.features.auth.service.impl;

import com.emenu.enums.user.UserType;
import com.emenu.exception.custom.ResourceNotFoundException;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.dto.filter.RoleFilterRequest;
import com.emenu.features.auth.dto.request.RoleCreateRequest;
import com.emenu.features.auth.dto.response.RoleDetailResponse;
import com.emenu.features.auth.dto.response.RoleResponse;
import com.emenu.features.auth.dto.update.RoleUpdateRequest;
import com.emenu.features.auth.mapper.ResponseBuilderMapper;
import com.emenu.features.auth.mapper.RoleMapper;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.models.Role;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.auth.repository.RoleRepository;
import com.emenu.features.auth.service.RoleService;
import com.emenu.shared.constants.AuthConstants;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.pagination.PaginationUtils;
import com.emenu.shared.utils.EnumUtils;
import com.emenu.shared.utils.FilterUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final BusinessRepository businessRepository;
    private final RoleMapper roleMapper;
    private final ResponseBuilderMapper responseBuilderMapper;

    @Override
    public RoleResponse createRole(RoleCreateRequest request) {
        log.info("ROLE_CREATE_INITIATED: name={}, type={}, business_id={}",
                request.getName(), request.getUserType(), request.getBusinessId());

        String normalizedName = EnumUtils.normalize(request.getName());
        UserType normalizedUserType = EnumUtils.parseEnum(request.getUserType().toString(), UserType.class, "user type");

        if (request.getBusinessId() != null) {
            businessRepository.findByIdAndIsDeletedFalse(request.getBusinessId())
                    .orElseThrow(() -> {
                        log.warn("ROLE_CREATE_FAILED_BUSINESS_NOT_FOUND: business_id={}", request.getBusinessId());
                        return new ValidationException("Business not found");
                    });

            if (roleRepository.existsByNameAndBusinessIdAndIsDeletedFalse(normalizedName, request.getBusinessId())) {
                log.warn("ROLE_CREATE_FAILED_DUPLICATE: name={}, business_id={}", normalizedName, request.getBusinessId());
                throw new ValidationException("Role with this name already exists for this business");
            }
        } else {
            if (roleRepository.existsByNameAndBusinessIdIsNullAndIsDeletedFalse(normalizedName)) {
                log.warn("ROLE_CREATE_FAILED_DUPLICATE: name={}", normalizedName);
                throw new ValidationException("Platform role with this name already exists");
            }
        }

        Role role = roleMapper.toEntity(request);
        role.setName(normalizedName);
        role.setUserType(normalizedUserType);

        Role savedRole = roleRepository.save(role);
        log.info("ROLE_CREATE_SUCCESS: id={}, name={}, type={}", savedRole.getId(), savedRole.getName(), savedRole.getUserType());

        return roleMapper.toResponse(savedRole);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<RoleResponse> getAllRoles(RoleFilterRequest request) {
        Pageable pageable = PaginationUtils.createPageable(
                request.getPageNo(),
                request.getPageSize(),
                request.getSortBy(),
                request.getSortDirection()
        );

        List<UserType> userTypes = FilterUtils.nullIfEmpty(request.getUserTypes());
        Boolean includeAll = request.getIncludeAll() != null && request.getIncludeAll();

        Page<Role> rolesPage = roleRepository.findAllWithFilters(
                request.getBusinessId(),
                userTypes,
                request.getSearch(),
                includeAll,
                pageable
        );

        List<RoleResponse> responses = new ArrayList<>(rolesPage.getContent().stream()
                .map(roleMapper::toResponse)
                .toList());

        if (includeAll && rolesPage.getNumber() == 0) {
            responses.add(0, buildAllRolesResponse(request.getBusinessId()));
        }

        log.info("ROLES_LIST_FETCHED: count={}, page={}/{}", responses.size(), rolesPage.getNumber() + 1, rolesPage.getTotalPages());

        return PaginationResponse.<RoleResponse>builder()
                .content(responses)
                .pageNo(rolesPage.getNumber() + 1)
                .pageSize(rolesPage.getSize())
                .totalElements(includeAll && rolesPage.getNumber() == 0 ? rolesPage.getTotalElements() + 1 : rolesPage.getTotalElements())
                .totalPages(rolesPage.getTotalPages())
                .last(rolesPage.isLast())
                .first(rolesPage.isFirst())
                .build();
    }

    private RoleResponse buildAllRolesResponse(UUID businessId) {
        return responseBuilderMapper.buildAllRolesResponse(businessId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRolesList(RoleFilterRequest request) {
        List<UserType> userTypes = FilterUtils.nullIfEmpty(request.getUserTypes());
        Boolean includeAll = request.getIncludeAll() != null && request.getIncludeAll();

        List<Role> roles = roleRepository.findAllListWithFilters(
                request.getBusinessId(),
                userTypes,
                request.getSearch(),
                includeAll
        );

        List<RoleResponse> responses = new ArrayList<>(roles.stream()
                .map(roleMapper::toResponse)
                .toList());

        if (includeAll) {
            responses.add(0, buildAllRolesResponse(request.getBusinessId()));
        }

        log.info("ROLES_LIST_FETCHED: count={}", responses.size());
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public RoleDetailResponse getRoleById(UUID roleId) {
        Role role = roleRepository.findByIdAndIsDeletedFalse(roleId)
                .orElseThrow(() -> {
                    log.warn("ROLE_NOT_FOUND: id={}", roleId);
                    return new ResourceNotFoundException("Role not found");
                });

        RoleDetailResponse response = roleMapper.toDetailResponse(role);
        if (role.getBusinessId() != null) {
            businessRepository.findByIdAndIsDeletedFalse(role.getBusinessId())
                    .ifPresent(business -> response.setBusinessName(business.getName()));
        }

        log.info("ROLE_DETAIL_RETRIEVED: id={}", roleId);
        return response;
    }

    @Override
    public RoleResponse updateRole(UUID roleId, RoleUpdateRequest request) {
        log.info("ROLE_UPDATE_INITIATED: id={}, name={}", roleId, request.getName());

        Role role = roleRepository.findByIdAndIsDeletedFalse(roleId)
                .orElseThrow(() -> {
                    log.warn("ROLE_UPDATE_FAILED_NOT_FOUND: id={}", roleId);
                    return new ResourceNotFoundException("Role not found");
                });

        if (isSystemRole(role.getName())) {
            log.warn("ROLE_UPDATE_FAILED_SYSTEM_ROLE: name={}", role.getName());
            throw new ValidationException("Cannot modify system roles");
        }

        if (request.getName() != null && !request.getName().isEmpty()) {
            String normalizedName = EnumUtils.normalize(request.getName());
            if (!normalizedName.equals(role.getName())) {
                validateRoleNameUniqueness(normalizedName, role);
                role.setName(normalizedName);
            }
        }

        roleMapper.updateEntity(request, role);
        Role savedRole = roleRepository.save(role);
        log.info("ROLE_UPDATE_SUCCESS: id={}, name={}", savedRole.getId(), savedRole.getName());

        return roleMapper.toResponse(savedRole);
    }

    private void validateRoleNameUniqueness(String normalizedName, Role role) {
        if (role.getBusinessId() != null) {
            if (roleRepository.existsByNameAndBusinessIdAndIsDeletedFalse(normalizedName, role.getBusinessId())) {
                log.warn("ROLE_UPDATE_FAILED_DUPLICATE: name={}, business_id={}", normalizedName, role.getBusinessId());
                throw new ValidationException("Role with this name already exists for this business");
            }
        } else {
            if (roleRepository.existsByNameAndBusinessIdIsNullAndIsDeletedFalse(normalizedName)) {
                log.warn("ROLE_UPDATE_FAILED_DUPLICATE: name={}", normalizedName);
                throw new ValidationException("Platform role with this name already exists");
            }
        }
    }

    @Override
    public RoleResponse deleteRole(UUID roleId) {
        log.info("ROLE_DELETE_INITIATED: id={}", roleId);

        Role role = roleRepository.findByIdAndIsDeletedFalse(roleId)
                .orElseThrow(() -> {
                    log.warn("ROLE_DELETE_FAILED_NOT_FOUND: id={}", roleId);
                    return new ResourceNotFoundException("Role not found");
                });

        if (isSystemRole(role.getName())) {
            log.warn("ROLE_DELETE_FAILED_SYSTEM_ROLE: name={}", role.getName());
            throw new ValidationException("Cannot delete system roles");
        }

        role.setIsDeleted(true);
        role.setDeletedAt(LocalDateTime.now());
        Role deletedRole = roleRepository.save(role);

        log.info("ROLE_DELETE_SUCCESS: id={}, name={}", deletedRole.getId(), deletedRole.getName());
        return roleMapper.toResponse(deletedRole);
    }

    private boolean isSystemRole(String roleName) {
        return List.of(
                AuthConstants.ROLE_PLATFORM_OWNER,
                AuthConstants.ROLE_BUSINESS_OWNER,
                AuthConstants.ROLE_CUSTOMER
        ).contains(roleName);
    }
}
