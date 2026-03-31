package com.emenu.features.order.service.impl;

import com.emenu.exception.custom.NotFoundException;
import com.emenu.features.order.dto.filter.ExchangeRateFilterRequest;
import com.emenu.features.order.dto.request.ExchangeRateCreateRequest;
import com.emenu.features.order.dto.response.ExchangeRateResponse;
import com.emenu.features.order.dto.update.ExchangeRateUpdateRequest;
import com.emenu.features.order.mapper.ExchangeRateMapper;
import com.emenu.features.order.models.ExchangeRate;
import com.emenu.features.order.repository.ExchangeRateRepository;
import com.emenu.features.order.service.ExchangeRateService;
import com.emenu.shared.constants.Constants;
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
public class ExchangeRateServiceImpl implements ExchangeRateService {

    private final ExchangeRateRepository exchangeRateRepository;
    private final ExchangeRateMapper exchangeRateMapper;
    private final com.emenu.shared.mapper.PaginationMapper paginationMapper;

    @Override
    public ExchangeRateResponse createExchangeRate(ExchangeRateCreateRequest request) {

        // Deactivate existing active rate
        deactivateCurrentActiveRate();

        ExchangeRate exchangeRate = exchangeRateMapper.toEntity(request);
        exchangeRate.setIsActive(true); // New rate is always active

        ExchangeRate savedExchangeRate = exchangeRateRepository.save(exchangeRate);

        return exchangeRateMapper.toResponse(savedExchangeRate);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ExchangeRateResponse> getAllExchangeRates(ExchangeRateFilterRequest filter) {
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<ExchangeRate> page = exchangeRateRepository.findAllWithFilters(
                filter.getIsActive(),
                filter.getSearch(),
                pageable
        );
        return exchangeRateMapper.toPaginationResponse(page, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public ExchangeRateResponse getExchangeRateById(UUID id) {
        ExchangeRate exchangeRate = findExchangeRateById(id);
        return exchangeRateMapper.toResponse(exchangeRate);
    }

    @Override
    public ExchangeRateResponse updateExchangeRate(UUID id, ExchangeRateUpdateRequest request) {
        ExchangeRate exchangeRate = findExchangeRateById(id);

        exchangeRateMapper.updateEntity(request, exchangeRate);
        ExchangeRate updatedExchangeRate = exchangeRateRepository.save(exchangeRate);

        return exchangeRateMapper.toResponse(updatedExchangeRate);
    }

    @Override
    public ExchangeRateResponse deleteExchangeRate(UUID id) {
        ExchangeRate exchangeRate = findExchangeRateById(id);

        // Don't allow deletion of the only active rate
        if (exchangeRate.getIsActive() && exchangeRateRepository.countActiveRates() == 1) {
            throw new RuntimeException("Cannot delete the only active exchange rate. Create a new rate first.");
        }

        exchangeRate.softDelete();
        exchangeRate = exchangeRateRepository.save(exchangeRate);

        return exchangeRateMapper.toResponse(exchangeRate);
    }

    @Override
    @Transactional(readOnly = true)
    public ExchangeRateResponse getCurrentActiveRate() {
        ExchangeRate activeRate = exchangeRateRepository.findActiveRate().orElseThrow(
                () -> new NotFoundException("No active exchange rate found")
        );

        return exchangeRateMapper.toResponse(activeRate);
    }

    // Private helper methods
    private ExchangeRate findExchangeRateById(UUID id) {
        return exchangeRateRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Exchange rate not found"));
    }

    private void deactivateCurrentActiveRate() {
        Optional<ExchangeRate> existingActiveRate = exchangeRateRepository.findActiveRate();
        if (existingActiveRate.isPresent()) {
            ExchangeRate rate = existingActiveRate.get();
            rate.setIsActive(false);
            exchangeRateRepository.save(rate);
        }
    }

}