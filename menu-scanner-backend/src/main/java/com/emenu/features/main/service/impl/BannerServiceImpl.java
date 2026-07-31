package com.emenu.features.main.service.impl;

import com.emenu.exception.custom.NotFoundException;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.models.User;
import com.emenu.features.main.dto.filter.BannerFilterRequest;
import com.emenu.features.main.dto.filter.BannerAllFilterRequest;
import com.emenu.features.main.dto.request.BannerCreateRequest;
import com.emenu.features.main.dto.response.BannerResponse;
import com.emenu.features.main.dto.update.BannerUpdateRequest;
import com.emenu.features.main.mapper.BannerMapper;
import com.emenu.features.main.models.Banner;
import com.emenu.features.main.repository.BannerRepository;
import com.emenu.features.main.service.BannerService;
import com.emenu.features.main.specification.BannerSpecification;
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
public class BannerServiceImpl implements BannerService {

    @Autowired
    @Lazy
    private BannerService self;

    private final BannerRepository bannerRepository;
    private final BannerMapper bannerMapper;
    private final SecurityUtils securityUtils;
    private final PaginationMapper paginationMapper;
    private final WebSocketNotificationService webSocketNotificationService;
    private final RequestCancellationRegistry cancellationRegistry;

    @Override
    public BannerResponse createBanner(@Valid BannerCreateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getBusinessId() == null) {
            throw new ValidationException("User is not associated with any business");
        }

        Banner banner = bannerMapper.toEntity(request);
        banner.setBusinessId(currentUser.getBusinessId());

        Banner savedBanner = bannerRepository.save(banner);
        log.info("Banner created successfully: id={}, businessId={}", savedBanner.getId(), currentUser.getBusinessId());
        return bannerMapper.toResponse(savedBanner);
    }

    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public BatchImportResponse<BannerResponse> createBannerBatch(List<BannerCreateRequest> requests, String importId) {
        log.info("Batch banner creation initiated: size={}, importId={}", requests.size(), importId);
        List<BatchImportResponse.RowResult<BannerResponse>> results = new ArrayList<>();
        int successCount = 0;
        int errorCount = 0;

        cancellationRegistry.registerImport(importId);

        try {
            for (int i = 0; i < requests.size(); i++) {
                cancellationRegistry.checkCancelled(importId);

                BannerCreateRequest req = requests.get(i);
                boolean success = false;
                String errorMsg = null;
                BannerResponse resp = null;
                try {
                    resp = self.createBanner(req);
                    results.add(new BatchImportResponse.RowResult<>(i, true, null, resp));
                    successCount++;
                    success = true;
                } catch (jakarta.validation.ConstraintViolationException ex) {
                    errorMsg = ex.getConstraintViolations().stream()
                            .map(jakarta.validation.ConstraintViolation::getMessage)
                            .collect(java.util.stream.Collectors.joining(", "));
                    log.error("Batch banner creation failed at index {} due to validation: {}", i, errorMsg);
                    results.add(new BatchImportResponse.RowResult<>(i, false, errorMsg, null));
                    errorCount++;
                } catch (Exception ex) {
                    log.error("Batch banner creation failed at index {}: {}", i, ex.getMessage());
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
    public PaginationResponse<BannerResponse> getAllBanners(BannerFilterRequest filter) {
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Specification<Banner> spec = BannerSpecification.filterBanners(
                filter.getBusinessId(),
                filter.getStatus(),
                filter.getSearch()
        );

        Page<Banner> bannerPage = bannerRepository.findAll(spec, pageable);
        return bannerMapper.toPaginationResponse(bannerPage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BannerResponse> getAllItemBanners(BannerAllFilterRequest filter) {
        Specification<Banner> spec = BannerSpecification.filterBanners(
                filter.getBusinessId(),
                filter.getStatus(),
                filter.getSearch()
        );

        Sort sort = PaginationUtils.createSort(filter.getSortBy(), filter.getSortDirection());
        List<Banner> banners = bannerRepository.findAll(spec, sort);
        return bannerMapper.toResponseList(banners);
    }

    @Override
    @Transactional(readOnly = true)
    public BannerResponse getBannerById(UUID id) {
        Banner banner = bannerRepository.findByIdWithBusiness(id)
                .orElseThrow(() -> new NotFoundException("Banner not found"));
        return bannerMapper.toResponse(banner);
    }

    @Override
    public BannerResponse updateBanner(UUID id, BannerUpdateRequest request) {
        Banner banner = bannerRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Banner not found"));

        bannerMapper.updateEntity(request, banner);
        Banner updatedBanner = bannerRepository.save(banner);

        log.info("Banner updated successfully: id={}", id);
        return bannerMapper.toResponse(updatedBanner);
    }

    @Override
    public BannerResponse deleteBanner(UUID id) {
        Banner banner = bannerRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Banner not found"));

        banner.softDelete();
        banner = bannerRepository.save(banner);

        log.info("Banner deleted successfully: id={}", id);
        return bannerMapper.toResponse(banner);
    }
}