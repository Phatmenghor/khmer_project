package com.emenu.features.order.service;

import com.emenu.enums.common.Status;
import com.emenu.exception.custom.ResourceNotFoundException;
import com.emenu.features.order.dto.filter.PaymentOptionFilterRequest;
import com.emenu.features.order.dto.request.PaymentOptionRequest;
import com.emenu.features.order.dto.response.PaymentOptionResponse;
import com.emenu.features.order.models.PaymentOption;
import com.emenu.features.order.repository.PaymentOptionRepository;
import com.emenu.shared.dto.PaginationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentOptionServiceImpl implements IPaymentOptionService {

    private final PaymentOptionRepository paymentOptionRepository;

    @Override
    @Transactional
    public PaymentOptionResponse createPaymentOption(UUID businessId, PaymentOptionRequest request) {
        log.info("Creating payment option: {} for business: {}", request.getName(), businessId);

        // Check if payment option with same name already exists
        paymentOptionRepository.findByNameAndBusinessId(businessId, request.getName())
                .ifPresent(existing -> {
                    throw new RuntimeException("Payment option '" + request.getName() + "' already exists for this business");
                });

        PaymentOption paymentOption = PaymentOption.builder()
                .businessId(businessId)
                .name(request.getName())
                .paymentOptionType(request.getPaymentOptionType())
                .status(request.getStatus())
                .build();

        PaymentOption saved = paymentOptionRepository.save(paymentOption);
        log.info("Payment option created: {}", saved.getId());
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentOptionResponse> getAllPaymentOptions(UUID businessId) {
        log.info("Getting all payment options for business: {}", businessId);
        List<PaymentOption> options = paymentOptionRepository.findByBusinessIdAndIsDeletedFalse(businessId);
        return options.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentOptionResponse> getActivePaymentOptions(UUID businessId) {
        log.info("Getting active payment options for business: {}", businessId);
        List<PaymentOption> options = paymentOptionRepository.findActiveByBusinessId(businessId);
        return options.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentOptionResponse> searchPaymentOptions(
            UUID businessId,
            String search,
            Status status,
            Pageable pageable) {
        log.info("Searching payment options for business: {} with filters", businessId);
        Page<PaymentOption> page = paymentOptionRepository.searchByBusinessId(
                businessId,
                search,
                status,
                pageable
        );
        return page.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentOptionResponse getPaymentOptionById(UUID businessId, UUID id) {
        log.info("Getting payment option: {} for business: {}", id, businessId);
        PaymentOption option = paymentOptionRepository.findByIdAndBusinessIdAndIsDeletedFalse(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment option not found"));
        return mapToResponse(option);
    }

    @Override
    @Transactional
    public PaymentOptionResponse updatePaymentOption(
            UUID businessId,
            UUID id,
            PaymentOptionRequest request) {
        log.info("Updating payment option: {} for business: {}", id, businessId);

        PaymentOption option = paymentOptionRepository.findByIdAndBusinessIdAndIsDeletedFalse(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment option not found"));

        // Check if new name is different and if it's already taken
        if (!option.getName().equals(request.getName())) {
            paymentOptionRepository.findByNameAndBusinessId(businessId, request.getName())
                    .ifPresent(existing -> {
                        throw new RuntimeException("Payment option '" + request.getName() + "' already exists for this business");
                    });
        }

        option.setName(request.getName());
        option.setPaymentOptionType(request.getPaymentOptionType());
        option.setStatus(request.getStatus());
        PaymentOption updated = paymentOptionRepository.save(option);
        log.info("Payment option updated: {}", id);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deletePaymentOption(UUID businessId, UUID id) {
        log.info("Deleting payment option: {} for business: {}", id, businessId);
        PaymentOption option = paymentOptionRepository.findByIdAndBusinessIdAndIsDeletedFalse(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment option not found"));

        option.setIsDeleted(true);
        paymentOptionRepository.save(option);
        log.info("Payment option deleted: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<PaymentOptionResponse> getAllPaymentOptionsWithFilters(
            UUID businessId,
            PaymentOptionFilterRequest filter) {
        log.info("Getting payment options for business: {} with filters", businessId);

        Sort.Direction direction = Sort.Direction.fromString(filter.getSortDirection());
        Pageable pageable = PageRequest.of(
                filter.getPageNo() - 1,
                filter.getPageSize(),
                Sort.by(direction, filter.getSortBy())
        );

        Page<PaymentOption> page = paymentOptionRepository.findAllByBusinessIdWithFilters(
                businessId,
                filter.getSearch(),
                filter.getStatuses(),
                pageable
        );

        return PaginationResponse.<PaymentOptionResponse>builder()
                .content(page.getContent().stream().map(this::mapToResponse).collect(Collectors.toList()))
                .pageNo(filter.getPageNo())
                .pageSize(filter.getPageSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentOptionResponse> getAllActivePaymentOptions() {
        log.info("Getting all active payment options");
        List<PaymentOption> options = paymentOptionRepository.findAllActive();
        return options.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Map PaymentOption entity to response DTO
     */
    private PaymentOptionResponse mapToResponse(PaymentOption option) {
        return PaymentOptionResponse.builder()
                .id(option.getId())
                .businessId(option.getBusinessId())
                .name(option.getName())
                .paymentOptionType(option.getPaymentOptionType())
                .status(option.getStatus())
                .createdAt(option.getCreatedAt())
                .updatedAt(option.getUpdatedAt())
                .build();
    }
}
