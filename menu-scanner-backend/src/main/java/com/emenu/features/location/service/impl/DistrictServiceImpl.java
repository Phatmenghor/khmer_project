package com.emenu.features.location.service.impl;

import com.emenu.exception.custom.ValidationException;
import com.emenu.features.location.dto.filter.DistrictFilterRequest;
import com.emenu.features.location.dto.request.DistrictRequest;
import com.emenu.features.location.dto.response.DistrictResponse;
import com.emenu.features.location.mapper.DistrictMapper;
import com.emenu.features.location.models.District;
import com.emenu.features.location.repository.DistrictRepository;
import com.emenu.features.location.repository.ProvinceRepository;
import com.emenu.features.location.service.DistrictService;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DistrictServiceImpl implements DistrictService {

    private final DistrictRepository districtRepository;
    private final DistrictMapper districtMapper;
    private final ProvinceRepository provinceRepository;
    private final PaginationMapper paginationMapper;

    @Override
    @Transactional
    public DistrictResponse createDistrict(DistrictRequest request) {
        validateProvinceExists(request.getProvinceCode());
        validateDistrictCodeNotDuplicate(request.getDistrictCode());

        District district = districtMapper.toEntity(request);
        District savedDistrict = districtRepository.save(district);

        District districtWithProvince = findDistrictById(savedDistrict.getId());
        DistrictResponse response = districtMapper.toResponse(districtWithProvince);

        log.info("District created successfully: id={}, code={}", savedDistrict.getId(), districtWithProvince.getDistrictCode());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<DistrictResponse> getAllDistricts(DistrictFilterRequest request) {
        Pageable pageable = PaginationUtils.createPageable(
            request.getPageNo(), request.getPageSize(),
            request.getSortBy(), request.getSortDirection()
        );

        Page<District> districtPage = districtRepository.searchDistricts(
            request.getProvinceCode(), request.getSearch(), pageable
        );

        return districtMapper.toPaginationResponse(districtPage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public DistrictResponse getDistrictById(UUID id) {
        District district = findDistrictById(id);
        return districtMapper.toResponse(district);
    }

    @Override
    @Transactional(readOnly = true)
    public DistrictResponse getDistrictByCode(String code) {
        District district = districtRepository.findByDistrictCodeAndIsDeletedFalse(code)
            .orElseThrow(() -> new RuntimeException("District not found with code: " + code));
        return districtMapper.toResponse(district);
    }

    @Override
    @Transactional(readOnly = true)
    public DistrictResponse getDistrictByNameEn(String nameEn) {
        District district = districtRepository.findByDistrictEnAndIsDeletedFalse(nameEn)
            .orElseThrow(() -> new RuntimeException("District not found with name: " + nameEn));
        return districtMapper.toResponse(district);
    }

    @Override
    @Transactional(readOnly = true)
    public DistrictResponse getDistrictByNameKh(String nameKh) {
        District district = districtRepository.findByDistrictKhAndIsDeletedFalse(nameKh)
            .orElseThrow(() -> new RuntimeException("District not found with Khmer name: " + nameKh));
        return districtMapper.toResponse(district);
    }

    @Override
    @Transactional
    public DistrictResponse updateDistrict(UUID id, DistrictRequest request) {
        District district = findDistrictById(id);

        if (request.getProvinceCode() != null &&
            !request.getProvinceCode().equals(district.getProvinceCode())) {
            validateProvinceExists(request.getProvinceCode());
        }

        districtMapper.updateEntity(request, district);
        districtRepository.save(district);

        District updatedDistrict = findDistrictById(id);
        log.info("District updated successfully: id={}, code={}", id, updatedDistrict.getDistrictCode());
        return districtMapper.toResponse(updatedDistrict);
    }

    @Override
    @Transactional
    public void deleteDistrict(UUID id) {
        District district = findDistrictById(id);
        district.softDelete();
        districtRepository.save(district);
        log.info("District deleted successfully: id={}, code={}", id, district.getDistrictCode());
    }

    private District findDistrictById(UUID id) {
        return districtRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new RuntimeException("District not found"));
    }

    private void validateProvinceExists(String provinceCode) {
        if (!provinceRepository.existsByProvinceCodeAndIsDeletedFalse(provinceCode)) {
            throw new ValidationException("Province code does not exist: " + provinceCode);
        }
    }

    private void validateDistrictCodeNotDuplicate(String districtCode) {
        if (districtRepository.existsByDistrictCodeAndIsDeletedFalse(districtCode)) {
            throw new ValidationException("District code already exists");
        }
    }
}
