package com.emenu.features.main.service.impl;

import com.emenu.exception.custom.NotFoundException;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.models.User;
import com.emenu.features.main.dto.filter.BrandFilterRequest;
import com.emenu.features.main.dto.filter.BrandAllFilterRequest;
import com.emenu.features.main.dto.request.BrandCreateRequest;
import com.emenu.features.main.dto.response.BrandResponse;
import com.emenu.features.main.dto.response.BrandWithProductCountResponse;
import com.emenu.features.main.dto.update.BrandUpdateRequest;
import com.emenu.features.main.mapper.BrandMapper;
import com.emenu.features.main.models.Brand;
import com.emenu.features.main.repository.BrandRepository;
import com.emenu.features.main.service.BrandService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;
    private final SecurityUtils securityUtils;
    private final com.emenu.shared.mapper.PaginationMapper paginationMapper;

    @Override
    public BrandResponse createBrand(BrandCreateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getBusinessId() == null) {
            throw new ValidationException("User is not associated with any business");
        }

        if (brandRepository.existsByNameAndBusinessIdAndIsDeletedFalse(
                request.getName(), currentUser.getBusinessId())) {
            throw new ValidationException("Brand name already exists in your business");
        }

        Brand brand = brandMapper.toEntity(request);
        brand.setBusinessId(currentUser.getBusinessId());

        Brand savedBrand = brandRepository.save(brand);

        log.info("Brand created successfully: id={}, name={}", savedBrand.getId(), savedBrand.getName());
        return brandMapper.toResponse(savedBrand);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<BrandResponse> getAllBrands(BrandFilterRequest filter) {
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<Brand> brandPage = brandRepository.findAllWithFilters(
                filter.getBusinessId(),
                filter.getStatus(),
                filter.getSearch(),
                pageable
        );
        return brandMapper.toPaginationResponse(brandPage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<BrandWithProductCountResponse> getBrandsWithProductCount(BrandFilterRequest filter) {
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<Brand> brandPage = brandRepository.findAllWithFilters(
                filter.getBusinessId(),
                filter.getStatus(),
                filter.getSearch(),
                pageable
        );

        List<UUID> brandIds = brandPage.getContent().stream()
                .map(Brand::getId)
                .toList();

        List<Object[]> productCountData = brandRepository.countTotalAndActiveProductsForBrands(brandIds);

        java.util.Map<UUID, Long> totalProductCountMap = new java.util.HashMap<>();
        java.util.Map<UUID, Long> activeProductCountMap = new java.util.HashMap<>();
        for (Object[] data : productCountData) {
            UUID brandId = (UUID) data[0];
            totalProductCountMap.put(brandId, ((Number) data[1]).longValue());
            activeProductCountMap.put(brandId, ((Number) data[2]).longValue());
        }

        List<BrandWithProductCountResponse> responses = brandPage.getContent().stream()
                .map(brand -> {
                    BrandWithProductCountResponse response = new BrandWithProductCountResponse();
                    BrandResponse baseResponse = brandMapper.toResponse(brand);

                    response.setId(baseResponse.getId());
                    response.setCreatedAt(baseResponse.getCreatedAt());
                    response.setUpdatedAt(baseResponse.getUpdatedAt());
                    response.setCreatedBy(baseResponse.getCreatedBy());
                    response.setUpdatedBy(baseResponse.getUpdatedBy());
                    response.setBusinessId(baseResponse.getBusinessId());
                    response.setBusinessName(baseResponse.getBusinessName());
                    response.setName(baseResponse.getName());
                    response.setImageUrl(baseResponse.getImageUrl());
                    response.setDescription(baseResponse.getDescription());
                    response.setStatus(baseResponse.getStatus());

                    response.setTotalProducts(totalProductCountMap.getOrDefault(brand.getId(), 0L));
                    response.setActiveProducts(activeProductCountMap.getOrDefault(brand.getId(), 0L));

                    return response;
                })
                .toList();

        PaginationResponse<BrandWithProductCountResponse> paginationResponse = new PaginationResponse<>();
        paginationResponse.setContent(responses);
        paginationResponse.setPageNo(brandPage.getNumber() + 1);
        paginationResponse.setPageSize(brandPage.getSize());
        paginationResponse.setTotalElements(brandPage.getTotalElements());
        paginationResponse.setTotalPages(brandPage.getTotalPages());
        paginationResponse.setFirst(brandPage.isFirst());
        paginationResponse.setLast(brandPage.isLast());
        paginationResponse.setHasNext(brandPage.hasNext());
        paginationResponse.setHasPrevious(brandPage.hasPrevious());

        return paginationResponse;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BrandResponse> getAllListBrands(BrandAllFilterRequest filter) {
        List<Brand> brandList = brandRepository.findAllWithFilters(
                filter.getBusinessId(),
                filter.getStatus(),
                filter.getSearch(),
                PaginationUtils.createSort(filter.getSortBy(), filter.getSortDirection())
        );
        return brandMapper.toResponseList(brandList);
    }

    @Override
    @Transactional(readOnly = true)
    public BrandResponse getBrandById(UUID id) {
        Brand brand = findBrandById(id);
        return brandMapper.toResponse(brand);
    }

    @Override
    public BrandResponse updateBrand(UUID id, BrandUpdateRequest request) {
        Brand brand = findBrandById(id);

        if (request.getName() != null && !request.getName().equals(brand.getName())) {
            if (brandRepository.existsByNameAndBusinessIdAndIsDeletedFalse(
                    request.getName(), brand.getBusinessId())) {
                throw new ValidationException("Brand name already exists in your business");
            }
        }

        brandMapper.updateEntity(request, brand);
        Brand updatedBrand = brandRepository.save(brand);

        log.info("Brand updated successfully: id={}", id);
        return brandMapper.toResponse(updatedBrand);
    }

    @Override
    public BrandResponse deleteBrand(UUID id) {
        Brand brand = findBrandById(id);

        long productCount = brandRepository.countByBusinessId(brand.getId());
        if (productCount > 0) {
            throw new ValidationException("Cannot delete brand that is used by products");
        }

        brand.softDelete();
        brand = brandRepository.save(brand);

        log.info("Brand deleted successfully: id={}", id);
        return brandMapper.toResponse(brand);
    }

    private Brand findBrandById(UUID id) {
        return brandRepository.findByIdWithBusiness(id)
                .orElseThrow(() -> new NotFoundException("Brand not found"));
    }
}