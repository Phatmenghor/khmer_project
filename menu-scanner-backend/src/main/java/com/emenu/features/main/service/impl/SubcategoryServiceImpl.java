package com.emenu.features.main.service.impl;

import com.emenu.exception.custom.NotFoundException;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.models.User;
import com.emenu.features.main.dto.filter.SubcategoryAllFilterRequest;
import com.emenu.features.main.dto.filter.SubcategoryFilterRequest;
import com.emenu.features.main.dto.request.SubcategoryCreateRequest;
import com.emenu.features.main.dto.response.SubcategoryResponse;
import com.emenu.features.main.dto.update.SubcategoryUpdateRequest;
import com.emenu.features.main.mapper.SubcategoryMapper;
import com.emenu.features.main.models.Category;
import com.emenu.features.main.models.Subcategory;
import com.emenu.features.main.repository.CategoryRepository;
import com.emenu.features.main.repository.SubcategoryRepository;
import com.emenu.features.main.service.SubcategoryService;
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
public class SubcategoryServiceImpl implements SubcategoryService {

    private final SubcategoryRepository subcategoryRepository;
    private final CategoryRepository categoryRepository;
    private final SubcategoryMapper subcategoryMapper;
    private final SecurityUtils securityUtils;
    private final com.emenu.shared.mapper.PaginationMapper paginationMapper;

    @Override
    public SubcategoryResponse createSubcategory(SubcategoryCreateRequest request) {
        log.info("Creating subcategory: {}", request.getName());

        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getBusinessId() == null) {
            throw new ValidationException("User is not associated with any business");
        }

        // Verify category exists and belongs to the business
        Category category = categoryRepository.findByIdAndIsDeletedFalse(request.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));

        if (!category.getBusinessId().equals(currentUser.getBusinessId())) {
            throw new ValidationException("Category does not belong to your business");
        }

        // Check if subcategory name already exists for this category and business
        if (subcategoryRepository.existsByNameAndCategoryIdAndBusinessIdAndIsDeletedFalse(
                request.getName(), request.getCategoryId(), currentUser.getBusinessId())) {
            throw new ValidationException("Subcategory name already exists for this category in your business");
        }

        Subcategory subcategory = subcategoryMapper.toEntity(request);
        subcategory.setBusinessId(currentUser.getBusinessId());

        Subcategory savedSubcategory = subcategoryRepository.save(subcategory);

        log.info("Subcategory created successfully: {} for business: {}",
                savedSubcategory.getName(), currentUser.getBusinessId());
        return subcategoryMapper.toResponse(savedSubcategory);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<SubcategoryResponse> getAllSubcategories(SubcategoryFilterRequest filter) {
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<Subcategory> subcategoryPage = subcategoryRepository.findAllWithFilters(
                filter.getBusinessId(),
                filter.getCategoryId(),
                filter.getStatus(),
                filter.getSearch(),
                pageable
        );
        return subcategoryMapper.toPaginationResponse(subcategoryPage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubcategoryResponse> getAllItemSubcategories(SubcategoryAllFilterRequest filter) {
        List<Subcategory> subcategories = subcategoryRepository.findAllWithFilters(
                filter.getBusinessId(),
                filter.getCategoryId(),
                filter.getStatus(),
                filter.getSearch(),
                PaginationUtils.createSort(filter.getSortBy(), filter.getSortDirection())
        );
        return subcategoryMapper.toResponseList(subcategories);
    }

    @Override
    @Transactional(readOnly = true)
    public SubcategoryResponse getSubcategoryById(UUID id) {
        Subcategory subcategory = findSubcategoryById(id);
        return subcategoryMapper.toResponse(subcategory);
    }

    @Override
    public SubcategoryResponse updateSubcategory(UUID id, SubcategoryUpdateRequest request) {
        Subcategory subcategory = findSubcategoryById(id);

        // If category is being changed, verify the new category exists and belongs to the business
        if (request.getCategoryId() != null && !request.getCategoryId().equals(subcategory.getCategoryId())) {
            Category category = categoryRepository.findByIdAndIsDeletedFalse(request.getCategoryId())
                    .orElseThrow(() -> new NotFoundException("Category not found"));

            if (!category.getBusinessId().equals(subcategory.getBusinessId())) {
                throw new ValidationException("Category does not belong to your business");
            }
        }

        // Check if new name already exists (if name is being changed)
        if (request.getName() != null && !request.getName().equals(subcategory.getName())) {
            UUID categoryId = request.getCategoryId() != null ? request.getCategoryId() : subcategory.getCategoryId();
            if (subcategoryRepository.existsByNameAndCategoryIdAndBusinessIdAndIsDeletedFalse(
                    request.getName(), categoryId, subcategory.getBusinessId())) {
                throw new ValidationException("Subcategory name already exists for this category in your business");
            }
        }

        subcategoryMapper.updateEntity(request, subcategory);
        Subcategory updatedSubcategory = subcategoryRepository.save(subcategory);

        log.info("Subcategory updated successfully: {}", id);
        return subcategoryMapper.toResponse(updatedSubcategory);
    }

    @Override
    public SubcategoryResponse deleteSubcategory(UUID id) {
        Subcategory subcategory = findSubcategoryById(id);

        subcategory.softDelete();
        subcategory = subcategoryRepository.save(subcategory);

        log.info("Subcategory deleted successfully: {}", id);
        return subcategoryMapper.toResponse(subcategory);
    }

    // Private helper methods
    private Subcategory findSubcategoryById(UUID id) {
        return subcategoryRepository.findByIdWithBusiness(id)
                .orElseThrow(() -> new NotFoundException("Subcategory not found"));
    }
}
