package com.emenu.features.order.service.impl;

import com.emenu.enums.common.Status;
import com.emenu.exception.custom.ResourceNotFoundException;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.order.dto.filter.PaymentOptionFilterRequest;
import com.emenu.features.order.dto.request.PaymentOptionRequest;
import com.emenu.features.order.dto.response.PaymentOptionResponse;
import com.emenu.features.order.models.PaymentOption;
import com.emenu.features.order.repository.PaymentOptionRepository;
import com.emenu.features.order.service.PaymentOptionService;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import com.emenu.features.notification.websocket.service.WebSocketNotificationService;
import com.emenu.shared.dto.BatchImportResponse;
import com.emenu.shared.cancellation.RequestCancellationRegistry;
import com.emenu.shared.mapper.PaginationMapper;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import java.util.ArrayList;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Validated
public class PaymentOptionServiceImpl implements PaymentOptionService {

    @Autowired
    @Lazy
    private PaymentOptionService self;

    private final PaymentOptionRepository paymentOptionRepository;
    private final WebSocketNotificationService webSocketNotificationService;
    private final RequestCancellationRegistry cancellationRegistry;

    @Override
    @Transactional
    public PaymentOptionResponse createPaymentOption(UUID businessId, @Valid PaymentOptionRequest request) {
        log.info("Creating payment option: {} for business: {}", request.getName(), businessId);

        // Check if payment option with same name already exists
        paymentOptionRepository.findByNameAndBusinessId(businessId, request.getName())
                .ifPresent(existing -> {
                    throw new ValidationException("Payment option '" + request.getName() + "' already exists for this business");
                });

        PaymentOption paymentOption = PaymentOption.builder()
                .businessId(businessId)
                .name(request.getName())
                .paymentOptionType(request.getPaymentOptionType())
                .status(request.getStatus())
                .image(request.getImage())
                .build();

        PaymentOption saved = paymentOptionRepository.save(paymentOption);
        log.info("Payment option created: {}", saved.getId());
        return mapToResponse(saved);
    }

    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public BatchImportResponse<PaymentOptionResponse> createPaymentOptionBatch(UUID businessId, List<PaymentOptionRequest> requests, String importId) {
        log.info("Batch payment option creation initiated: size={}, importId={}", requests.size(), importId);
        List<BatchImportResponse.RowResult<PaymentOptionResponse>> results = new ArrayList<>();
        int successCount = 0;
        int errorCount = 0;

        cancellationRegistry.registerImport(importId);

        try {
            for (int i = 0; i < requests.size(); i++) {
                cancellationRegistry.checkCancelled(importId);

                PaymentOptionRequest req = requests.get(i);
                boolean success = false;
                String errorMsg = null;
                PaymentOptionResponse resp = null;
                try {
                    resp = self.createPaymentOption(businessId, req);
                    results.add(new BatchImportResponse.RowResult<>(i, true, null, resp));
                    successCount++;
                    success = true;
                } catch (jakarta.validation.ConstraintViolationException ex) {
                    errorMsg = ex.getConstraintViolations().stream()
                            .map(jakarta.validation.ConstraintViolation::getMessage)
                            .collect(java.util.stream.Collectors.joining(", "));
                    log.error("Batch payment option creation failed at index {} due to validation: {}", i, errorMsg);
                    results.add(new BatchImportResponse.RowResult<>(i, false, errorMsg, null));
                    errorCount++;
                } catch (Exception ex) {
                    log.error("Batch payment option creation failed at index {}: {}", i, ex.getMessage());
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
                        throw new ValidationException("Payment option '" + request.getName() + "' already exists for this business");
                    });
        }

        option.setName(request.getName());
        option.setPaymentOptionType(request.getPaymentOptionType());
        option.setStatus(request.getStatus());
        option.setImage(request.getImage());
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

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(),
                filter.getPageSize(),
                filter.getSortBy(),
                filter.getSortDirection()
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

    private PaymentOptionResponse mapToResponse(PaymentOption option) {
        return PaymentOptionResponse.builder()
                .id(option.getId())
                .businessId(option.getBusinessId())
                .name(option.getName())
                .paymentOptionType(option.getPaymentOptionType())
                .status(option.getStatus())
                .image(option.getImage())
                .createdAt(option.getCreatedAt())
                .updatedAt(option.getUpdatedAt())
                .build();
    }
}

