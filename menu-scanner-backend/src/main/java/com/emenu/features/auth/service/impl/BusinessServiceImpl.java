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
        if (businessRepository.existsByNameAndIsDeletedFalse(request.getName())) {
            throw new ValidationException("Business name already exists");
        }

        Business business = businessMapper.toEntity(request);
        Business savedBusiness = businessRepository.save(business);

        log.info("Business created: {}", savedBusiness.getName());
        return businessMapper.toResponse(savedBusiness);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<BusinessResponse> getAllBusinesses(BusinessFilterRequest request) {
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

        return businessMapper.toPaginationResponse(businessPage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessResponse getBusinessById(UUID businessId) {
        Business business = businessRepository.findByIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> new ValidationException("Business not found"));
        return businessMapper.toResponse(business);
    }

    @Override
    public BusinessResponse updateBusiness(UUID businessId, BusinessCreateRequest request) {
        Business business = businessRepository.findByIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> new ValidationException("Business not found"));

        business.setName(request.getName());
        business.setEmail(request.getEmail());
        business.setPhone(request.getPhone());
        business.setAddress(request.getAddress());
        business.setDescription(request.getDescription());

        Business updatedBusiness = businessRepository.save(business);

        log.info("Business updated: {}", updatedBusiness.getName());
        return businessMapper.toResponse(updatedBusiness);
    }

    @Override
    public void deleteBusiness(UUID businessId) {
        Business business = businessRepository.findByIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> new ValidationException("Business not found"));

        business.softDelete();
        businessRepository.save(business);
        log.info("Business deleted: {}", business.getName());
    }
}
