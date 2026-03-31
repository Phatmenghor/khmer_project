package com.emenu.features.order.service.impl;

import com.emenu.enums.common.Status;
import com.emenu.exception.custom.ResourceNotFoundException;
import com.emenu.features.order.dto.filter.PaymentOptionFilterRequest;
import com.emenu.features.order.dto.request.PaymentOptionRequest;
import com.emenu.features.order.dto.response.PaymentOptionResponse;
import com.emenu.features.order.models.PaymentOption;
import com.emenu.features.order.repository.PaymentOptionRepository;
import com.emenu.features.order.service.PaymentOptionService;
import com.emenu.shared.dto.PaginationResponse;
import lombok.RequiredArgsConstructor;
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
public class PaymentOptionServiceImpl implements PaymentOptionService {

    private final PaymentOptionRepository paymentOptionRepository;

    @Override
    @Transactional
    public PaymentOptionResponse createPaymentOption(UUID businessId, PaymentOptionRequest request) {

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
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentOptionResponse getPaymentOptionById(UUID businessId, UUID id) {
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
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deletePaymentOption(UUID businessId, UUID id) {
        PaymentOption option = paymentOptionRepository.findByIdAndBusinessIdAndIsDeletedFalse(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment option not found"));

        option.setIsDeleted(true);
        paymentOptionRepository.save(option);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<PaymentOptionResponse> getAllPaymentOptionsWithFilters(
            UUID businessId,
            PaymentOptionFilterRequest filter) {

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
