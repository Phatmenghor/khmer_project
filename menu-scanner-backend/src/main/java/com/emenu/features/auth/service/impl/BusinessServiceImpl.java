package com.emenu.features.auth.service.impl;

import com.emenu.enums.user.BusinessStatus;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.dto.filter.BusinessFilterRequest;
import com.emenu.features.auth.dto.request.BusinessCreateRequest;
import com.emenu.features.auth.dto.response.BusinessResponse;
import com.emenu.features.auth.mapper.BusinessMapper;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.auth.service.BusinessService;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.pagination.PaginationUtils;
import com.emenu.shared.utils.FilterUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BusinessServiceImpl implements BusinessService {

    private final BusinessRepository businessRepository;
    private final BusinessMapper businessMapper;
    private final com.emenu.shared.mapper.PaginationMapper paginationMapper;

    @Override
    public BusinessResponse createBusiness(BusinessCreateRequest request) {
        log.info("Creating business: name={}", request.getName());

        if (businessRepository.existsByNameAndIsDeletedFalse(request.getName())) {
            log.warn("Business creation failed - name already exists: {}", request.getName());
            throw new ValidationException("Business name already exists");
        }

        Business business = businessMapper.toEntity(request);
        Business savedBusiness = businessRepository.save(business);
        log.info("Business created successfully: id={}, name={}", savedBusiness.getId(), savedBusiness.getName());

        return businessMapper.toResponse(savedBusiness);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<BusinessResponse> getAllBusinesses(BusinessFilterRequest request) {
        log.debug("Fetching businesses - statuses: {}, hasActiveSubscription: {}, page: {}/{}",
                request.getStatus(), request.getHasActiveSubscription(),
                request.getPageNo(), request.getPageSize());

        Pageable pageable = PaginationUtils.createPageable(
                request.getPageNo(),
                request.getPageSize(),
                request.getSortBy(),
                request.getSortDirection()
        );

        List<BusinessStatus> businessStatuses = FilterUtils.nullIfEmpty(request.getStatus());

        Page<Business> businessPage = businessRepository.searchBusinesses(
                businessStatuses,
                request.getHasActiveSubscription(),
                request.getSearch(),
                pageable
        );

        log.info("Retrieved {} businesses (page {}/{})",
                businessPage.getNumberOfElements(), businessPage.getNumber() + 1, businessPage.getTotalPages());
        return businessMapper.toPaginationResponse(businessPage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessResponse getBusinessById(UUID businessId) {
        log.debug("Fetching business details: {}", businessId);

        Business business = businessRepository.findByIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> {
                    log.warn("Business not found: {}", businessId);
                    return new ValidationException("Business not found");
                });

        log.debug("Business details retrieved: {}", businessId);
        return businessMapper.toResponse(business);
    }

    @Override
    public BusinessResponse updateBusiness(UUID businessId, BusinessCreateRequest request) {
        log.info("Updating business: id={}, name={}", businessId, request.getName());

        Business business = businessRepository.findByIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> {
                    log.warn("Business update failed - not found: {}", businessId);
                    return new ValidationException("Business not found");
                });

        business.setName(request.getName());
        business.setEmail(request.getEmail());
        business.setPhone(request.getPhone());
        business.setAddress(request.getAddress());
        business.setDescription(request.getDescription());

        Business updatedBusiness = businessRepository.save(business);
        log.info("Business updated successfully: id={}, name={}", updatedBusiness.getId(), updatedBusiness.getName());

        return businessMapper.toResponse(updatedBusiness);
    }

    @Override
    public void deleteBusiness(UUID businessId) {
        log.info("Deleting business: id={}", businessId);

        Business business = businessRepository.findByIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> {
                    log.warn("Business deletion failed - not found: {}", businessId);
                    return new ValidationException("Business not found");
                });

        business.softDelete();
        businessRepository.save(business);
        log.info("Business deleted successfully: id={}, name={}", business.getId(), business.getName());
    }
}
