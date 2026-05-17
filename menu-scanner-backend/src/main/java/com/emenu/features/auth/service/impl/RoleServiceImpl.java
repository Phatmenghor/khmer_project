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
        log.info("Creating role: name={}, type={}, business={}",
                request.getName(), request.getUserType(), request.getBusinessId());

        String normalizedName = EnumUtils.normalize(request.getName());
        UserType normalizedUserType = EnumUtils.parseEnum(request.getUserType().toString(), UserType.class, "user type");
        log.debug("Role name normalized: {} -> {}", request.getName(), normalizedName);

        if (request.getBusinessId() != null) {
            businessRepository.findByIdAndIsDeletedFalse(request.getBusinessId())
                    .orElseThrow(() -> {
                        log.warn("Role creation failed - business not found: {}", request.getBusinessId());
                        return new ValidationException("Business not found");
                    });

            if (roleRepository.existsByNameAndBusinessIdAndIsDeletedFalse(normalizedName, request.getBusinessId())) {
                log.warn("Role creation failed - role already exists for business: {} in business {}", normalizedName, request.getBusinessId());
                throw new ValidationException("Role with this name already exists for this business");
            }
        } else {
            if (roleRepository.existsByNameAndBusinessIdIsNullAndIsDeletedFalse(normalizedName)) {
                log.warn("Role creation failed - platform role already exists: {}", normalizedName);
                throw new ValidationException("Platform role with this name already exists");
            }
        }

        Role role = roleMapper.toEntity(request);
        role.setName(normalizedName);
        role.setUserType(normalizedUserType);

        Role savedRole = roleRepository.save(role);
        log.info("Role created successfully: id={}, name={}, type={}", savedRole.getId(), savedRole.getName(), savedRole.getUserType());

        return roleMapper.toResponse(savedRole);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<RoleResponse> getAllRoles(RoleFilterRequest request) {
        log.debug("Fetching roles - business: {}, types: {}, includeAll: {}, page: {}/{}",
                request.getBusinessId(), request.getUserTypes(), request.getIncludeAll(),
                request.getPageNo(), request.getPageSize());

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

        log.info("Retrieved {} roles (page {}/{})", responses.size(), rolesPage.getNumber() + 1, rolesPage.getTotalPages());

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
        log.debug("Fetching roles as list - business: {}, types: {}, includeAll: {}",
                request.getBusinessId(), request.getUserTypes(), request.getIncludeAll());

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

        log.info("Retrieved {} roles as list", responses.size());
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public RoleDetailResponse getRoleById(UUID roleId) {
        log.debug("Fetching role details: {}", roleId);

        Role role = roleRepository.findByIdAndIsDeletedFalse(roleId)
                .orElseThrow(() -> {
                    log.warn("Role not found: {}", roleId);
                    return new ResourceNotFoundException("Role not found");
                });

        RoleDetailResponse response = roleMapper.toDetailResponse(role);
        if (role.getBusinessId() != null) {
            businessRepository.findByIdAndIsDeletedFalse(role.getBusinessId())
                    .ifPresent(business -> response.setBusinessName(business.getName()));
        }

        log.debug("Role details retrieved: {}", roleId);
        return response;
    }

    @Override
    public RoleResponse updateRole(UUID roleId, RoleUpdateRequest request) {
        log.info("Updating role: id={}, name={}", roleId, request.getName());

        Role role = roleRepository.findByIdAndIsDeletedFalse(roleId)
                .orElseThrow(() -> {
                    log.warn("Role update failed - not found: {}", roleId);
                    return new ResourceNotFoundException("Role not found");
                });

        if (isSystemRole(role.getName())) {
            log.warn("Role update failed - cannot modify system role: {}", role.getName());
            throw new ValidationException("Cannot modify system roles");
        }

        if (request.getName() != null && !request.getName().isEmpty()) {
            String normalizedName = EnumUtils.normalize(request.getName());
            if (!normalizedName.equals(role.getName())) {
                log.debug("Role name update: {} -> {}", role.getName(), normalizedName);
                validateRoleNameUniqueness(normalizedName, role);
                role.setName(normalizedName);
            }
        }

        roleMapper.updateEntity(request, role);
        Role savedRole = roleRepository.save(role);
        log.info("Role updated successfully: id={}, name={}", savedRole.getId(), savedRole.getName());

        return roleMapper.toResponse(savedRole);
    }

    private void validateRoleNameUniqueness(String normalizedName, Role role) {
        if (role.getBusinessId() != null) {
            if (roleRepository.existsByNameAndBusinessIdAndIsDeletedFalse(normalizedName, role.getBusinessId())) {
                log.warn("Role name update failed - name already exists for business: {} in business {}", normalizedName, role.getBusinessId());
                throw new ValidationException("Role with this name already exists for this business");
            }
        } else {
            if (roleRepository.existsByNameAndBusinessIdIsNullAndIsDeletedFalse(normalizedName)) {
                log.warn("Role name update failed - platform role already exists: {}", normalizedName);
                throw new ValidationException("Platform role with this name already exists");
            }
        }
    }

    @Override
    public RoleResponse deleteRole(UUID roleId) {
        log.info("Deleting role: {}", roleId);

        Role role = roleRepository.findByIdAndIsDeletedFalse(roleId)
                .orElseThrow(() -> {
                    log.warn("Role deletion failed - not found: {}", roleId);
                    return new ResourceNotFoundException("Role not found");
                });

        if (isSystemRole(role.getName())) {
            log.warn("Role deletion failed - cannot delete system role: {}", role.getName());
            throw new ValidationException("Cannot delete system roles");
        }

        role.setIsDeleted(true);
        role.setDeletedAt(LocalDateTime.now());
        Role deletedRole = roleRepository.save(role);

        log.info("Role deleted successfully: id={}, name={}", deletedRole.getId(), deletedRole.getName());
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
