package com.emenu.features.main.service.impl;

import com.emenu.exception.custom.NotFoundException;
import com.emenu.shared.constants.CacheNames;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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
import org.springframework.transaction.annotation.Propagation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import com.emenu.shared.dto.BatchImportResponse;
import java.util.ArrayList;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BannerServiceImpl implements BannerService {

    @Autowired
    @Lazy
    private BannerService self;

    private final BannerRepository bannerRepository;
    private final BannerMapper bannerMapper;
    private final SecurityUtils securityUtils;
    private final com.emenu.shared.mapper.PaginationMapper paginationMapper;

    @Override
    @CacheEvict(value = CacheNames.BANNERS, allEntries = true)
    public BannerResponse createBanner(BannerCreateRequest request) {
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
    public BatchImportResponse<BannerResponse> createBannerBatch(List<BannerCreateRequest> requests) {
        log.info("Batch banner creation initiated: size={}", requests.size());
        List<BatchImportResponse.RowResult<BannerResponse>> results = new ArrayList<>();
        int successCount = 0;
        int errorCount = 0;

        for (int i = 0; i < requests.size(); i++) {
            BannerCreateRequest req = requests.get(i);
            try {
                BannerResponse resp = self.createBanner(req);
                results.add(new BatchImportResponse.RowResult<>(i, true, null, resp));
                successCount++;
            } catch (Exception ex) {
                log.error("Batch banner creation failed at index {}: {}", i, ex.getMessage());
                results.add(new BatchImportResponse.RowResult<>(i, false, ex.getMessage(), null));
                errorCount++;
            }
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
    @Cacheable(value = CacheNames.BANNERS, key = "'list:' + #filter.businessId + ':' + #filter.status")
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
    @CacheEvict(value = CacheNames.BANNERS, allEntries = true)
    public BannerResponse updateBanner(UUID id, BannerUpdateRequest request) {
        Banner banner = bannerRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Banner not found"));

        bannerMapper.updateEntity(request, banner);
        Banner updatedBanner = bannerRepository.save(banner);

        log.info("Banner updated successfully: id={}", id);
        return bannerMapper.toResponse(updatedBanner);
    }

    @Override
    @CacheEvict(value = CacheNames.BANNERS, allEntries = true)
    public BannerResponse deleteBanner(UUID id) {
        Banner banner = bannerRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Banner not found"));

        banner.softDelete();
        banner = bannerRepository.save(banner);

        log.info("Banner deleted successfully: id={}", id);
        return bannerMapper.toResponse(banner);
    }
}