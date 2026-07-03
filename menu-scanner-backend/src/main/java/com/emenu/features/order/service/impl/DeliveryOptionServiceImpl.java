package com.emenu.features.order.service.impl;

import com.emenu.enums.common.Status;
import com.emenu.exception.custom.NotFoundException;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.models.User;
import com.emenu.features.order.dto.filter.DeliveryOptionAllFilterRequest;
import com.emenu.features.order.dto.filter.DeliveryOptionFilterRequest;
import com.emenu.features.order.dto.request.DeliveryOptionCreateRequest;
import com.emenu.features.order.dto.response.DeliveryOptionResponse;
import com.emenu.features.order.dto.update.DeliveryOptionUpdateRequest;
import com.emenu.features.order.mapper.DeliveryOptionMapper;
import com.emenu.features.order.models.DeliveryOption;
import com.emenu.features.order.repository.DeliveryOptionRepository;
import com.emenu.features.order.service.DeliveryOptionService;
import com.emenu.features.order.specification.DeliveryOptionSpecification;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.emenu.features.notification.websocket.service.WebSocketNotificationService;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import com.emenu.shared.dto.BatchImportResponse;
import com.emenu.shared.cancellation.RequestCancellationRegistry;
import com.emenu.shared.mapper.PaginationMapper;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import java.util.ArrayList;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
@Validated
public class DeliveryOptionServiceImpl implements DeliveryOptionService {

    @Autowired
    @Lazy
    private DeliveryOptionService self;

    private final DeliveryOptionRepository deliveryOptionRepository;
    private final DeliveryOptionMapper deliveryOptionMapper;
    private final SecurityUtils securityUtils;
    private final PaginationMapper paginationMapper;
    private final WebSocketNotificationService webSocketNotificationService;
    private final RequestCancellationRegistry cancellationRegistry;

    @Override
    public DeliveryOptionResponse createDeliveryOption(@Valid DeliveryOptionCreateRequest request) {
        log.info("Creating delivery option: {}", request.getName());

        User currentUser = securityUtils.getCurrentUser();
        validateUserBusinessAssociation(currentUser);

        // Check if name already exists for this business
        if (deliveryOptionRepository.existsByNameAndBusinessIdAndIsDeletedFalse(
                request.getName(), currentUser.getBusinessId())) {
            throw new ValidationException("Delivery option name already exists in your business");
        }

        DeliveryOption deliveryOption = deliveryOptionMapper.toEntity(request);
        deliveryOption.setBusinessId(currentUser.getBusinessId());

        DeliveryOption savedDeliveryOption = deliveryOptionRepository.save(deliveryOption);

        log.info("Delivery option created successfully: {} for business: {}",
                savedDeliveryOption.getName(), currentUser.getBusinessId());

        return deliveryOptionMapper.toResponse(savedDeliveryOption);
    }

    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public BatchImportResponse<DeliveryOptionResponse> createDeliveryOptionBatch(List<DeliveryOptionCreateRequest> requests, String importId) {
        log.info("Batch delivery option creation initiated: size={}, importId={}", requests.size(), importId);
        List<BatchImportResponse.RowResult<DeliveryOptionResponse>> results = new ArrayList<>();
        int successCount = 0;
        int errorCount = 0;

        cancellationRegistry.registerImport(importId);

        try {
            for (int i = 0; i < requests.size(); i++) {
                cancellationRegistry.checkCancelled(importId);

                DeliveryOptionCreateRequest req = requests.get(i);
                boolean success = false;
                String errorMsg = null;
                DeliveryOptionResponse resp = null;
                try {
                    resp = self.createDeliveryOption(req);
                    results.add(new BatchImportResponse.RowResult<>(i, true, null, resp));
                    successCount++;
                    success = true;
                } catch (jakarta.validation.ConstraintViolationException ex) {
                    errorMsg = ex.getConstraintViolations().stream()
                            .map(jakarta.validation.ConstraintViolation::getMessage)
                            .collect(java.util.stream.Collectors.joining(", "));
                    log.error("Batch delivery option creation failed at index {} due to validation: {}", i, errorMsg);
                    results.add(new BatchImportResponse.RowResult<>(i, false, errorMsg, null));
                    errorCount++;
                } catch (Exception ex) {
                    log.error("Batch delivery option creation failed at index {}: {}", i, ex.getMessage());
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
    public PaginationResponse<DeliveryOptionResponse> getAllDeliveryOptions(DeliveryOptionFilterRequest filter) {
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        List<Status> statuses = filter.getStatuses() != null && !filter.getStatuses().isEmpty()
                ? filter.getStatuses() : null;

        Specification<DeliveryOption> spec = DeliveryOptionSpecification.filterDeliveryOptions(
                filter.getBusinessId(),
                statuses,
                filter.getSearch(),
                filter.getMinPrice(),
                filter.getMaxPrice()
        );

        Page<DeliveryOption> deliveryOptionPage = deliveryOptionRepository.findAll(spec, pageable);
        return paginationMapper.toPaginationResponse(deliveryOptionPage, deliveryOptionMapper.toResponseList(deliveryOptionPage.getContent()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryOptionResponse> getAllItemDeliveryOptions(DeliveryOptionAllFilterRequest filter) {
        List<Status> statuses = filter.getStatuses() != null && !filter.getStatuses().isEmpty()
                ? filter.getStatuses() : null;

        Specification<DeliveryOption> spec = DeliveryOptionSpecification.filterDeliveryOptions(
                filter.getBusinessId(),
                statuses,
                filter.getSearch(),
                filter.getMinPrice(),
                filter.getMaxPrice()
        );

        Sort sort = PaginationUtils.createSort(filter.getSortBy(), filter.getSortDirection());
        List<DeliveryOption> deliveryOptions = deliveryOptionRepository.findAll(spec, sort);

        return deliveryOptionMapper.toResponseList(deliveryOptions);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryOptionResponse getDeliveryOptionById(UUID id) {
        DeliveryOption deliveryOption = findDeliveryOptionById(id);
        return deliveryOptionMapper.toResponse(deliveryOption);
    }

    @Override
    public DeliveryOptionResponse updateDeliveryOption(UUID id, DeliveryOptionUpdateRequest request) {
        DeliveryOption deliveryOption = findDeliveryOptionById(id);

        // Check if new name already exists (if name is being changed)
        if (request.getName() != null && !request.getName().equals(deliveryOption.getName())) {
            if (deliveryOptionRepository.existsByNameAndBusinessIdAndIsDeletedFalse(
                    request.getName(), deliveryOption.getBusinessId())) {
                throw new ValidationException("Delivery option name already exists in your business");
            }
        }

        deliveryOptionMapper.updateEntity(request, deliveryOption);
        DeliveryOption updatedDeliveryOption = deliveryOptionRepository.save(deliveryOption);

        log.info("Delivery option updated successfully: {}", id);
        return deliveryOptionMapper.toResponse(updatedDeliveryOption);
    }

    @Override
    public DeliveryOptionResponse deleteDeliveryOption(UUID id) {
        DeliveryOption deliveryOption = findDeliveryOptionById(id);

        deliveryOption.softDelete();
        deliveryOption = deliveryOptionRepository.save(deliveryOption);

        log.info("Delivery option deleted successfully: {}", id);
        return deliveryOptionMapper.toResponse(deliveryOption);
    }

    // ================================
    // PRIVATE HELPER METHODS
    // ================================

    private DeliveryOption findDeliveryOptionById(UUID id) {
        return deliveryOptionRepository.findByIdWithBusiness(id)
                .orElseThrow(() -> new NotFoundException("Delivery option not found"));
    }

    private void validateUserBusinessAssociation(User user) {
        if (user.getBusinessId() == null) {
            throw new ValidationException("User is not associated with any business");
        }
    }
}