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
import com.emenu.features.auth.specification.RoleSpecification;
import com.emenu.features.notification.websocket.service.WebSocketNotificationService;
import com.emenu.shared.constants.AuthConstants;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import com.emenu.shared.utils.EnumUtils;
import com.emenu.shared.utils.FilterUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import com.emenu.shared.dto.BatchImportResponse;
import com.emenu.shared.cancellation.RequestCancellationRegistry;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
@Validated
public class RoleServiceImpl implements RoleService {

    @Autowired
    @Lazy
    private RoleService self;

    private final RoleRepository roleRepository;
    private final BusinessRepository businessRepository;
    private final RoleMapper roleMapper;
    private final ResponseBuilderMapper responseBuilderMapper;
    private final PaginationMapper paginationMapper;
    private final WebSocketNotificationService webSocketNotificationService;
    private final RequestCancellationRegistry cancellationRegistry;

    @Override
    public RoleResponse createRole(@Valid RoleCreateRequest request) {
        log.info("Role creation initiated: name={}, type={}, business_id={}",
                request.getName(), request.getUserType(), request.getBusinessId());

        String normalizedName = EnumUtils.normalize(request.getName());
        UserType normalizedUserType = EnumUtils.parseEnum(request.getUserType().toString(), UserType.class, "user type");

        if (request.getBusinessId() != null) {
            businessRepository.findByIdAndIsDeletedFalse(request.getBusinessId())
                    .orElseThrow(() -> {
                        log.warn("Role creation failed - business not found: business_id={}", request.getBusinessId());
                        return new ValidationException("Business not found");
                    });

            if (roleRepository.existsByNameAndBusinessIdAndIsDeletedFalse(normalizedName, request.getBusinessId())) {
                log.warn("Role creation failed - duplicate name: name={}, business_id={}", normalizedName, request.getBusinessId());
                throw new ValidationException("Role with this name already exists for this business");
            }
        } else {
            if (roleRepository.existsByNameAndBusinessIdIsNullAndIsDeletedFalse(normalizedName)) {
                log.warn("Role creation failed - duplicate platform role: name={}", normalizedName);
                throw new ValidationException("Platform role with this name already exists");
            }
        }

        Role role = roleMapper.toEntity(request);
        role.setName(normalizedName);
        role.setUserType(normalizedUserType);

        Role savedRole = roleRepository.save(role);
        log.info("Role created successfully: id={}, name={}", savedRole.getId(), savedRole.getName());
        return roleMapper.toResponse(savedRole);
    }

    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public BatchImportResponse<RoleResponse> createRoleBatch(List<RoleCreateRequest> requests, String importId) {
        log.info("Batch role creation initiated: size={}, importId={}", requests.size(), importId);
        List<BatchImportResponse.RowResult<RoleResponse>> results = new ArrayList<>();
        int successCount = 0;
        int errorCount = 0;

        cancellationRegistry.registerImport(importId);

        try {
            for (int i = 0; i < requests.size(); i++) {
                cancellationRegistry.checkCancelled(importId);

                RoleCreateRequest req = requests.get(i);
                boolean success = false;
                String errorMsg = null;
                RoleResponse resp = null;
                try {
                    resp = self.createRole(req);
                    results.add(new BatchImportResponse.RowResult<>(i, true, null, resp));
                    successCount++;
                    success = true;
                } catch (jakarta.validation.ConstraintViolationException ex) {
                    errorMsg = ex.getConstraintViolations().stream()
                            .map(jakarta.validation.ConstraintViolation::getMessage)
                            .collect(java.util.stream.Collectors.joining(", "));
                    log.error("Batch role creation failed at index {} due to validation: {}", i, errorMsg);
                    results.add(new BatchImportResponse.RowResult<>(i, false, errorMsg, null));
                    errorCount++;
                } catch (Exception ex) {
                    log.error("Batch role creation failed at index {}: {}", i, ex.getMessage());
                    errorMsg = ex.getMessage();
                    results.add(new BatchImportResponse.RowResult<>(i, false, errorMsg, null));
                    errorCount++;
                }

                if (importId != null) {
                    int progress = (int) (((double) (i + 1) / requests.size()) * 100);
                    java.util.Map<String, Object> lastResult = java.util.Map.of(
                        "index", i,
                        "success", success,
                        "error", errorMsg != null ? errorMsg : ""
                    );
                    webSocketNotificationService.notifyImportProgress(
                        importId,
                        progress,
                        i + 1,
                        requests.size(),
                        successCount,
                        errorCount,
                        (i + 1) == requests.size(),
                        lastResult
                    );
                }
            }
        } finally {
            cancellationRegistry.cleanUp(importId);
        }

        return new BatchImportResponse<>(successCount, errorCount, results);
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

        Specification<Role> spec = RoleSpecification.findAllWithFiltersAndPlatform(
                request.getBusinessId(),
                userTypes,
                request.getSearch(),
                includeAll
        );

        Page<Role> rolesPage = roleRepository.findAll(spec, pageable);

        log.info("Roles fetched successfully: count={}, page={}/{}", rolesPage.getNumberOfElements(), rolesPage.getNumber() + 1, rolesPage.getTotalPages());

        List<RoleResponse> content = rolesPage.getContent().stream()
                .map(roleMapper::toResponse)
                .toList();

        if (includeAll && rolesPage.getNumber() == 0) {
            RoleResponse allRolesResponse = buildAllRolesResponse(request.getBusinessId());
            content = new ArrayList<>(content);
            ((ArrayList<RoleResponse>) content).add(0, allRolesResponse);
        }

        PaginationResponse<RoleResponse> response = paginationMapper.toPaginationResponse(rolesPage, content);

        if (includeAll && rolesPage.getNumber() == 0) {
            response.setTotalElements(response.getTotalElements() + 1);
        }

        return response;
    }

    private RoleResponse buildAllRolesResponse(UUID businessId) {
        return responseBuilderMapper.buildAllRolesResponse(businessId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRolesList(RoleFilterRequest request) {
        List<UserType> userTypes = FilterUtils.nullIfEmpty(request.getUserTypes());
        Boolean includeAll = request.getIncludeAll() != null && request.getIncludeAll();

        Specification<Role> spec = RoleSpecification.findAllWithFiltersAndPlatform(
                request.getBusinessId(),
                userTypes,
                request.getSearch(),
                includeAll
        );

        List<Role> roles = roleRepository.findAll(spec);

        List<RoleResponse> responses = new ArrayList<>(roles.stream()
                .map(roleMapper::toResponse)
                .toList());

        if (includeAll) {
            responses.add(0, buildAllRolesResponse(request.getBusinessId()));
        }

        log.info("Roles fetched successfully: count={}", responses.size());
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public RoleDetailResponse getRoleById(UUID roleId) {
        Role role = roleRepository.findByIdAndIsDeletedFalse(roleId)
                .orElseThrow(() -> {
                    log.warn("Role not found: id={}", roleId);
                    return new ResourceNotFoundException("Role not found");
                });

        RoleDetailResponse response = roleMapper.toDetailResponse(role);
        if (role.getBusinessId() != null) {
            businessRepository.findByIdAndIsDeletedFalse(role.getBusinessId())
                    .ifPresent(business -> response.setBusinessName(business.getName()));
        }

        log.info("Role details retrieved successfully: id={}", roleId);
        return response;
    }

    @Override
    public RoleResponse updateRole(UUID roleId, RoleUpdateRequest request) {
        log.info("Role update initiated: id={}, name={}", roleId, request.getName());

        Role role = roleRepository.findByIdAndIsDeletedFalse(roleId)
                .orElseThrow(() -> {
                    log.warn("Role not found for update: id={}", roleId);
                    return new ResourceNotFoundException("Role not found");
                });

        if (isSystemRole(role.getName())) {
            log.warn("Role update failed - system role: name={}", role.getName());
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
        log.info("Role updated successfully: id={}, name={}", savedRole.getId(), savedRole.getName());
        webSocketNotificationService.notifyPlatformEvent("ROLE_CHANGED", Map.of("action", "updated", "roleId", savedRole.getId().toString()));

        return roleMapper.toResponse(savedRole);
    }

    private void validateRoleNameUniqueness(String normalizedName, Role role) {
        if (role.getBusinessId() != null) {
            if (roleRepository.existsByNameAndBusinessIdAndIsDeletedFalse(normalizedName, role.getBusinessId())) {
                log.warn("Role update failed - duplicate name: name={}, business_id={}", normalizedName, role.getBusinessId());
                throw new ValidationException("Role with this name already exists for this business");
            }
        } else {
            if (roleRepository.existsByNameAndBusinessIdIsNullAndIsDeletedFalse(normalizedName)) {
                log.warn("Role update failed - duplicate platform role: name={}", normalizedName);
                throw new ValidationException("Platform role with this name already exists");
            }
        }
    }

    @Override
    public RoleResponse deleteRole(UUID roleId) {
        log.info("Role deletion initiated: id={}", roleId);

        Role role = roleRepository.findByIdAndIsDeletedFalse(roleId)
                .orElseThrow(() -> {
                    log.warn("Role not found for deletion: id={}", roleId);
                    return new ResourceNotFoundException("Role not found");
                });

        if (isSystemRole(role.getName())) {
            log.warn("Role deletion failed - system role: name={}", role.getName());
            throw new ValidationException("Cannot delete system roles");
        }

        role.setIsDeleted(true);
        role.setDeletedAt(LocalDateTime.now());
        Role deletedRole = roleRepository.save(role);

        log.info("Role deleted successfully: id={}, name={}", deletedRole.getId(), deletedRole.getName());
        webSocketNotificationService.notifyPlatformEvent("ROLE_CHANGED", Map.of("action", "deleted", "roleId", deletedRole.getId().toString()));
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
