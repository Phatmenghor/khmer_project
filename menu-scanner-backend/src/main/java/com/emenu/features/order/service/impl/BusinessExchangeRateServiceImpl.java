package com.emenu.features.order.service.impl;

import com.emenu.exception.custom.NotFoundException;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.order.dto.filter.BusinessExchangeRateFilterRequest;
import com.emenu.features.order.dto.request.BusinessExchangeRateCreateRequest;
import com.emenu.features.order.dto.response.BusinessExchangeRateResponse;
import com.emenu.features.order.dto.update.BusinessExchangeRateUpdateRequest;
import com.emenu.features.order.mapper.BusinessExchangeRateMapper;
import com.emenu.features.order.models.BusinessExchangeRate;
import com.emenu.features.order.repository.BusinessExchangeRateRepository;
import com.emenu.features.order.service.BusinessExchangeRateService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class BusinessExchangeRateServiceImpl implements BusinessExchangeRateService {

    private final BusinessExchangeRateRepository exchangeRateRepository;
    private final BusinessRepository businessRepository;
    private final BusinessExchangeRateMapper exchangeRateMapper;
    private final SecurityUtils securityUtils;
    private final com.emenu.shared.mapper.PaginationMapper paginationMapper;

    @Override
    public BusinessExchangeRateResponse createBusinessExchangeRate(BusinessExchangeRateCreateRequest request) {

        UUID businessId = determineBusinessId(request.getBusinessId());

        // Validate business exists
        Business business = businessRepository.findByIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> new NotFoundException("Business not found"));

        // Deactivate all existing active rates for this business (new rate will be the only ACTIVE one)
        int deactivatedCount = exchangeRateRepository.deactivateAllRatesForBusiness(businessId);
        if (deactivatedCount > 0) {
        }

        BusinessExchangeRate exchangeRate = exchangeRateMapper.toEntity(request);
        exchangeRate.setStatus(BusinessExchangeRate.ExchangeRateStatus.ACTIVE); // New rate is always active

        BusinessExchangeRate savedExchangeRate = exchangeRateRepository.save(exchangeRate);

        return exchangeRateMapper.toResponse(savedExchangeRate);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<BusinessExchangeRateResponse> getAllBusinessExchangeRates(BusinessExchangeRateFilterRequest filter) {

        UUID businessId = determineBusinessId(filter.getBusinessId());
        filter.setBusinessId(businessId);

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<BusinessExchangeRate> page = exchangeRateRepository.findAllWithFilters(
                businessId,
                filter.getStatus(),
                filter.getSearch(),
                pageable
        );
        return exchangeRateMapper.toPaginationResponse(page, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessExchangeRateResponse getBusinessExchangeRateById(UUID id) {

        BusinessExchangeRate exchangeRate = findExchangeRateById(id);
        return exchangeRateMapper.toResponse(exchangeRate);
    }

    @Override
    public BusinessExchangeRateResponse updateBusinessExchangeRate(UUID id, BusinessExchangeRateUpdateRequest request) {

        BusinessExchangeRate exchangeRate = findExchangeRateById(id);
        UUID businessId = exchangeRate.getBusinessId();

        // If updating to ACTIVE status, deactivate all other active rates for this business
        if (request.getStatus() != null &&
            request.getStatus() == BusinessExchangeRate.ExchangeRateStatus.ACTIVE) {
            // Deactivate all OTHER active rates (except this one)
            int deactivatedCount = exchangeRateRepository.deactivateAllRatesForBusinessExcept(businessId, id);
            if (deactivatedCount > 0) {
            }
        } else if (request.getStatus() != null &&
                   request.getStatus() == BusinessExchangeRate.ExchangeRateStatus.INACTIVE &&
                   exchangeRate.isActive()) {
            // If deactivating the only ACTIVE rate, activate the most recently created INACTIVE rate
            if (exchangeRateRepository.countActiveRates(businessId) == 1) {
                Optional<BusinessExchangeRate> nextActiveRate = exchangeRateRepository.findMostRecentInactiveRateByBusinessId(businessId);
                if (nextActiveRate.isPresent()) {
                    BusinessExchangeRate rateToActivate = nextActiveRate.get();
                    rateToActivate.activate();
                    exchangeRateRepository.save(rateToActivate);
                }
            }
        }

        exchangeRateMapper.updateEntity(request, exchangeRate);
        BusinessExchangeRate updatedExchangeRate = exchangeRateRepository.save(exchangeRate);

        return exchangeRateMapper.toResponse(updatedExchangeRate);
    }

    @Override
    public BusinessExchangeRateResponse deleteBusinessExchangeRate(UUID id) {

        BusinessExchangeRate exchangeRate = findExchangeRateById(id);
        UUID businessId = exchangeRate.getBusinessId();

        // If deleting the only ACTIVE rate, activate the most recent INACTIVE rate
        if (exchangeRate.isActive() && exchangeRateRepository.countActiveRates(businessId) == 1) {
            Optional<BusinessExchangeRate> nextActiveRate = exchangeRateRepository.findMostRecentInactiveRateByBusinessId(businessId);

            if (nextActiveRate.isEmpty()) {
                throw new ValidationException("Cannot delete the only exchange rate. At least one rate must exist for a business.");
            }

            // Activate the most recent inactive rate
            BusinessExchangeRate rateToActivate = nextActiveRate.get();
            rateToActivate.activate();
            exchangeRateRepository.save(rateToActivate);
        }

        exchangeRate.softDelete();
        exchangeRate = exchangeRateRepository.save(exchangeRate);

        return exchangeRateMapper.toResponse(exchangeRate);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessExchangeRateResponse getActiveRateByBusinessId(UUID businessId) {

        BusinessExchangeRate activeRate = exchangeRateRepository.findActiveRateByBusinessId(businessId)
                .orElseThrow(() -> new NotFoundException("No active exchange rate found for business"));

        return exchangeRateMapper.toResponse(activeRate);
    }

    // Private helper methods

    private BusinessExchangeRate findExchangeRateById(UUID id) {
        return exchangeRateRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Business exchange rate not found"));
    }

    private UUID determineBusinessId(UUID requestedBusinessId) {
        if (requestedBusinessId != null) {
            return requestedBusinessId;
        }

        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getBusinessId() == null) {
            throw new ValidationException("User is not associated with any business");
        }

        return currentUser.getBusinessId();
    }
}