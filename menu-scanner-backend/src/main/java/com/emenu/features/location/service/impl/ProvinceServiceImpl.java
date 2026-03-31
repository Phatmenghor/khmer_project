package com.emenu.features.location.service.impl;

import com.emenu.exception.custom.ValidationException;
import com.emenu.features.location.dto.filter.ProvinceFilterRequest;
import com.emenu.features.location.dto.request.ProvinceRequest;
import com.emenu.features.location.dto.response.ProvinceResponse;
import com.emenu.features.location.mapper.ProvinceMapper;
import com.emenu.features.location.models.Province;
import com.emenu.features.location.repository.ProvinceRepository;
import com.emenu.features.location.service.ProvinceService;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProvinceServiceImpl implements ProvinceService {

    private final ProvinceRepository provinceRepository;
    private final ProvinceMapper provinceMapper;
    private final PaginationMapper paginationMapper;

    @Override
    public ProvinceResponse createProvince(ProvinceRequest request) {
        
        if (provinceRepository.existsByProvinceCodeAndIsDeletedFalse(request.getProvinceCode())) {
            throw new ValidationException("Province code already exists");
        }
        
        Province province = provinceMapper.toEntity(request);
        Province savedProvince = provinceRepository.save(province);
        
        return provinceMapper.toResponse(savedProvince);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ProvinceResponse> getAllProvinces(ProvinceFilterRequest request) {
        
        Pageable pageable = PaginationUtils.createPageable(
            request.getPageNo(), request.getPageSize(), 
            request.getSortBy(), request.getSortDirection()
        );
        
        Page<Province> provincePage = provinceRepository.searchProvinces(
            request.getSearch(), pageable
        );

        return provinceMapper.toPaginationResponse(provincePage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public ProvinceResponse getProvinceById(UUID id) {
        Province province = provinceRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new RuntimeException("Province not found"));
        return provinceMapper.toResponse(province);
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
    public ProvinceResponse updateProvince(UUID id, ProvinceRequest request) {
        
        Province province = provinceRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new RuntimeException("Province not found"));
        
        provinceMapper.updateEntity(request, province);
        Province updatedProvince = provinceRepository.save(province);
        
        return provinceMapper.toResponse(updatedProvince);
    }

    @Override
    public void deleteProvince(UUID id) {
        Province province = provinceRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new RuntimeException("Province not found"));
        
        province.softDelete();
        provinceRepository.save(province);
    }

}