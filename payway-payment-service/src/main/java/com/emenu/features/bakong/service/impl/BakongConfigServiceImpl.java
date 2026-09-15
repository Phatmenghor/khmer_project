package com.emenu.features.bakong.service.impl;

import com.emenu.features.bakong.dto.BakongConfigCreateRequest;
import com.emenu.features.bakong.dto.BakongConfigResponse;
import com.emenu.features.bakong.dto.BakongConfigSearchRequest;
import com.emenu.features.bakong.dto.BakongConfigUpdateRequest;
import com.emenu.features.bakong.dto.BakongIdRequest;
import com.emenu.features.bakong.mapper.BakongConfigMapper;
import com.emenu.features.bakong.model.BakongConfig;
import com.emenu.features.bakong.model.BakongDailyQuotaLog;
import com.emenu.features.bakong.repository.BakongConfigRepository;
import com.emenu.features.bakong.repository.BakongDailyQuotaRepository;
import com.emenu.features.bakong.service.BakongConfigService;
import com.emenu.shared.dto.PageResponse;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BakongConfigServiceImpl implements BakongConfigService {

    private final BakongConfigRepository repository;
    private final BakongDailyQuotaRepository quotaRepository;
    private final BakongConfigMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BakongConfigResponse> getAllConfigs(BakongConfigSearchRequest request) {
        log.info("Fetching Bakong configurations with request: {}", request);
        String search = (request != null) ? PaginationUtils.extractSearch(request.getSearch()) : null;
        Pageable pageable = PaginationUtils.createPageable(
                request != null ? request.getPageNo() : null,
                request != null ? request.getPageSize() : null
        );
        Page<BakongConfig> pageResult = repository.searchConfigs(search, pageable);
        return PaginationUtils.toPageResponse(pageResult, c -> enrichWithQuota(mapper.toResponse(c)));
    }

    @Override
    @Transactional(readOnly = true)
    public BakongConfigResponse getConfigById(UUID id) {
        log.info("Fetching Bakong configuration by ID: {}", id);
        BakongConfig config = repository.findById(id)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new RuntimeException("Bakong configuration not found with id: " + id));
        return enrichWithQuota(mapper.toResponse(config));
    }

    @Override
    @Transactional(readOnly = true)
    public BakongConfigResponse getConfigById(BakongIdRequest request) {
        return getConfigById(request.getId());
    }

    @Override
    @Transactional
    public BakongConfigResponse createConfig(BakongConfigCreateRequest request) {
        log.info("Creating new Bakong configuration: {}", request.getConfigName());
        repository.findByConfigName(request.getConfigName()).ifPresent(existing -> {
            if (!existing.isDeleted()) {
                throw new IllegalArgumentException("Bakong configuration with name '" + request.getConfigName() + "' already exists");
            }
        });

        BakongConfig config = mapper.toEntity(request);
        return enrichWithQuota(mapper.toResponse(repository.save(config)));
    }

    @Override
    @Transactional
    public BakongConfigResponse updateConfig(UUID id, BakongConfigUpdateRequest request) {
        log.info("Updating Bakong configuration ID: {}", id);
        BakongConfig config = repository.findById(id)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new RuntimeException("Bakong configuration not found with id: " + id));

        mapper.updateEntityFromRequest(request, config);
        return enrichWithQuota(mapper.toResponse(repository.save(config)));
    }

    @Override
    @Transactional
    public BakongConfigResponse updateConfig(BakongConfigUpdateRequest request) {
        return updateConfig(request.getId(), request);
    }

    @Override
    @Transactional
    public BakongConfigResponse deleteConfig(UUID id) {
        log.info("Deleting Bakong configuration ID: {}", id);
        BakongConfig config = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bakong configuration not found with id: " + id));
        config.setDeleted(true);
        config.setEnabled(false);
        BakongConfig saved = repository.save(config);
        return enrichWithQuota(mapper.toResponse(saved));
    }

    @Override
    @Transactional
    public BakongConfigResponse deleteConfig(BakongIdRequest request) {
        return deleteConfig(request.getId());
    }

    private BakongConfigResponse enrichWithQuota(BakongConfigResponse response) {
        if (response == null || response.getEmail() == null) {
            return response;
        }
        LocalDate today = LocalDate.now();
        int maxLimit = response.getDailyRateLimit() > 0 ? response.getDailyRateLimit() : 100;
        int usedCount = quotaRepository.findByQuotaDateAndEmail(today, response.getEmail())
                .map(BakongDailyQuotaLog::getRequestCount)
                .orElse(0);

        int remaining = Math.max(0, maxLimit - usedCount);
        double percentage = maxLimit > 0 ? ((double) usedCount / maxLimit * 100.0) : 0.0;
        boolean limitReached = usedCount >= maxLimit;

        response.setUsedCount(usedCount);
        response.setRemainingQuota(remaining);
        response.setUsagePercentage(Math.round(percentage * 10.0) / 10.0);
        response.setLimitReached(limitReached);
        response.setActive(response.isEnabled() && !limitReached);

        return response;
    }
}
