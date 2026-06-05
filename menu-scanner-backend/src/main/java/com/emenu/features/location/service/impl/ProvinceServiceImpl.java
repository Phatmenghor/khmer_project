package com.emenu.features.location.service.impl;

import com.emenu.exception.custom.ValidationException;
import com.emenu.shared.constants.CacheNames;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import com.emenu.features.location.dto.filter.ProvinceFilterRequest;
import com.emenu.features.location.dto.request.ProvinceRequest;
import com.emenu.features.location.dto.response.ProvinceResponse;
import com.emenu.features.location.mapper.ProvinceMapper;
import com.emenu.features.location.models.Province;
import com.emenu.features.location.repository.ProvinceRepository;
import com.emenu.features.location.service.ProvinceService;
import com.emenu.features.notification.websocket.service.WebSocketNotificationService;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProvinceServiceImpl implements ProvinceService {

    private final ProvinceRepository provinceRepository;
    private final ProvinceMapper provinceMapper;
    private final PaginationMapper paginationMapper;
    private final WebSocketNotificationService webSocketNotificationService;

    @Override
    @CacheEvict(value = CacheNames.PROVINCES, allEntries = true)
    public ProvinceResponse createProvince(ProvinceRequest request) {
        validateProvinceCodeNotDuplicate(request.getProvinceCode());

        Province province = provinceMapper.toEntity(request);
        Province savedProvince = provinceRepository.save(province);

        log.info("Province created successfully: id={}, code={}", savedProvince.getId(), savedProvince.getProvinceCode());
        webSocketNotificationService.notifyPlatformEvent("LOCATION_CHANGED", Map.of("action", "created", "type", "province"));
        return provinceMapper.toResponse(savedProvince);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CacheNames.PROVINCES, key = "'all:' + #request.pageNo + ':' + #request.pageSize + ':' + #request.search")
    public PaginationResponse<ProvinceResponse> getAllProvinces(ProvinceFilterRequest request) {
        Pageable pageable = PaginationUtils.createPageable(
            request.getPageNo(), request.getPageSize(),
            request.getSortBy(), request.getSortDirection()
        );
        Page<Province> provincePage = provinceRepository.searchProvinces(request.getSearch(), pageable);
        return provinceMapper.toPaginationResponse(provincePage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public ProvinceResponse getProvinceById(UUID id) {
        return provinceMapper.toResponse(findProvinceById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public ProvinceResponse getProvinceByCode(String code) {
        Province province = provinceRepository.findByProvinceCodeAndIsDeletedFalse(code)
            .orElseThrow(() -> new RuntimeException("Province not found with code: " + code));
        return provinceMapper.toResponse(province);
    }

    @Override
    @Transactional(readOnly = true)
    public ProvinceResponse getProvinceByNameEn(String nameEn) {
        Province province = provinceRepository.findByProvinceEnAndIsDeletedFalse(nameEn)
            .orElseThrow(() -> new RuntimeException("Province not found with name: " + nameEn));
        return provinceMapper.toResponse(province);
    }

    @Override
    @Transactional(readOnly = true)
    public ProvinceResponse getProvinceByNameKh(String nameKh) {
        Province province = provinceRepository.findByProvinceKhAndIsDeletedFalse(nameKh)
            .orElseThrow(() -> new RuntimeException("Province not found with Khmer name: " + nameKh));
        return provinceMapper.toResponse(province);
    }

    @Override
    @CacheEvict(value = CacheNames.PROVINCES, allEntries = true)
    public ProvinceResponse updateProvince(UUID id, ProvinceRequest request) {
        Province province = findProvinceById(id);
        provinceMapper.updateEntity(request, province);
        Province updatedProvince = provinceRepository.save(province);
        log.info("Province updated successfully: id={}, code={}", id, updatedProvince.getProvinceCode());
        webSocketNotificationService.notifyPlatformEvent("LOCATION_CHANGED", Map.of("action", "updated", "type", "province"));
        return provinceMapper.toResponse(updatedProvince);
    }

    @Override
    @CacheEvict(value = CacheNames.PROVINCES, allEntries = true)
    public void deleteProvince(UUID id) {
        Province province = findProvinceById(id);
        province.softDelete();
        provinceRepository.save(province);
        log.info("Province deleted successfully: id={}, code={}", id, province.getProvinceCode());
        webSocketNotificationService.notifyPlatformEvent("LOCATION_CHANGED", Map.of("action", "deleted", "type", "province"));
    }

    private Province findProvinceById(UUID id) {
        return provinceRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new RuntimeException("Province not found"));
    }

    private void validateProvinceCodeNotDuplicate(String provinceCode) {
        if (provinceRepository.existsByProvinceCodeAndIsDeletedFalse(provinceCode)) {
            throw new ValidationException("Province code already exists");
        }
    }
}