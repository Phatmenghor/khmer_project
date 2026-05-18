package com.emenu.features.location.service.impl;

import com.emenu.exception.custom.ValidationException;
import com.emenu.features.location.dto.filter.CommuneFilterRequest;
import com.emenu.features.location.dto.request.CommuneRequest;
import com.emenu.features.location.dto.response.CommuneResponse;
import com.emenu.features.location.mapper.CommuneMapper;
import com.emenu.features.location.models.Commune;
import com.emenu.features.location.repository.CommuneRepository;
import com.emenu.features.location.repository.DistrictRepository;
import com.emenu.features.location.service.CommuneService;
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
public class CommuneServiceImpl implements CommuneService {

    private final CommuneRepository communeRepository;
    private final CommuneMapper communeMapper;
    private final DistrictRepository districtRepository;
    private final PaginationMapper paginationMapper;

    @Override
    @Transactional
    public CommuneResponse createCommune(CommuneRequest request) {
        validateDistrictExists(request.getDistrictCode());
        validateCommuneCodeNotDuplicate(request.getCommuneCode());

        Commune commune = communeMapper.toEntity(request);
        Commune savedCommune = communeRepository.save(commune);

        Commune communeWithRelations = findCommuneById(savedCommune.getId());
        CommuneResponse response = communeMapper.toResponse(communeWithRelations);

        log.info("Commune created successfully: id={}, code={}", savedCommune.getId(), communeWithRelations.getCommuneCode());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<CommuneResponse> getAllCommunes(CommuneFilterRequest request) {
        Pageable pageable = PaginationUtils.createPageable(
            request.getPageNo(), request.getPageSize(),
            request.getSortBy(), request.getSortDirection()
        );

        Page<Commune> communePage = communeRepository.searchCommunes(
            request.getDistrictCode(), request.getProvinceCode(),
            request.getSearch(), pageable
        );

        return communeMapper.toPaginationResponse(communePage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public CommuneResponse getCommuneById(UUID id) {
        Commune commune = findCommuneById(id);
        return communeMapper.toResponse(commune);
    }

    @Override
    @Transactional(readOnly = true)
    public CommuneResponse getCommuneByCode(String code) {
        Commune commune = communeRepository.findByCommuneCodeAndIsDeletedFalse(code)
            .orElseThrow(() -> new RuntimeException("Commune not found with code: " + code));
        return communeMapper.toResponse(commune);
    }

    @Override
    @Transactional(readOnly = true)
    public CommuneResponse getCommuneByNameEn(String nameEn) {
        Commune commune = communeRepository.findByCommuneEnAndIsDeletedFalse(nameEn)
            .orElseThrow(() -> new RuntimeException("Commune not found with name: " + nameEn));
        return communeMapper.toResponse(commune);
    }

    @Override
    @Transactional(readOnly = true)
    public CommuneResponse getCommuneByNameKh(String nameKh) {
        Commune commune = communeRepository.findByCommuneKhAndIsDeletedFalse(nameKh)
            .orElseThrow(() -> new RuntimeException("Commune not found with Khmer name: " + nameKh));
        return communeMapper.toResponse(commune);
    }

    @Override
    @Transactional
    public CommuneResponse updateCommune(UUID id, CommuneRequest request) {
        Commune commune = findCommuneById(id);

        if (request.getDistrictCode() != null &&
            !request.getDistrictCode().equals(commune.getDistrictCode())) {
            validateDistrictExists(request.getDistrictCode());
        }

        communeMapper.updateEntity(request, commune);
        communeRepository.save(commune);

        Commune updatedCommune = findCommuneById(id);
        log.info("Commune updated successfully: id={}, code={}", id, updatedCommune.getCommuneCode());
        return communeMapper.toResponse(updatedCommune);
    }

    @Override
    @Transactional
    public void deleteCommune(UUID id) {
        Commune commune = findCommuneById(id);
        commune.softDelete();
        communeRepository.save(commune);
        log.info("Commune deleted successfully: id={}, code={}", id, commune.getCommuneCode());
    }

    private Commune findCommuneById(UUID id) {
        return communeRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new RuntimeException("Commune not found"));
    }

    private void validateDistrictExists(String districtCode) {
        if (!districtRepository.existsByDistrictCodeAndIsDeletedFalse(districtCode)) {
            throw new ValidationException("District code does not exist: " + districtCode);
        }
    }

    private void validateCommuneCodeNotDuplicate(String communeCode) {
        if (communeRepository.existsByCommuneCodeAndIsDeletedFalse(communeCode)) {
            throw new ValidationException("Commune code already exists");
        }
    }
}