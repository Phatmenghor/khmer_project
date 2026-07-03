package com.emenu.features.main.service.impl;

import com.emenu.exception.custom.NotFoundException;
import com.emenu.shared.constants.CacheNames;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.models.User;
import com.emenu.features.main.dto.filter.CategoryAllFilterRequest;
import com.emenu.features.main.dto.filter.CategoryFilterRequest;
import com.emenu.features.main.dto.request.CategoryCreateRequest;
import com.emenu.features.main.dto.response.CategoryResponse;
import com.emenu.features.main.dto.response.CategoryWithProductCountResponse;
import com.emenu.features.main.dto.update.CategoryUpdateRequest;
import com.emenu.features.main.mapper.CategoryMapper;
import com.emenu.features.main.models.Category;
import com.emenu.features.main.repository.CategoryRepository;
import com.emenu.features.main.service.CategoryService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.emenu.features.notification.websocket.service.WebSocketNotificationService;
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
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    @Lazy
    private CategoryService self;

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final SecurityUtils securityUtils;
    private final com.emenu.shared.mapper.PaginationMapper paginationMapper;
    private final WebSocketNotificationService webSocketNotificationService;

    @Override
    @CacheEvict(value = CacheNames.CATEGORIES, allEntries = true)
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getBusinessId() == null) {
            throw new ValidationException("User is not associated with any business");
        }

        if (categoryRepository.existsByNameAndBusinessIdAndIsDeletedFalse(
                request.getName(), currentUser.getBusinessId())) {
            throw new ValidationException("Category name already exists in your business");
        }

        Category category = categoryMapper.toEntity(request);
        category.setBusinessId(currentUser.getBusinessId());

        Category savedCategory = categoryRepository.save(category);

        log.info("Category created successfully: id={}, name={}", savedCategory.getId(), savedCategory.getName());
        return categoryMapper.toResponse(savedCategory);
    }

    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public BatchImportResponse<CategoryResponse> createCategoryBatch(List<CategoryCreateRequest> requests, String importId) {
        log.info("Batch category creation initiated: size={}, importId={}", requests.size(), importId);
        List<BatchImportResponse.RowResult<CategoryResponse>> results = new ArrayList<>();
        int successCount = 0;
        int errorCount = 0;

        for (int i = 0; i < requests.size(); i++) {
            CategoryCreateRequest req = requests.get(i);
            boolean success = false;
            String errorMsg = null;
            CategoryResponse resp = null;
            try {
                resp = self.createCategory(req);
                results.add(new BatchImportResponse.RowResult<>(i, true, null, resp));
                successCount++;
                success = true;
            } catch (Exception ex) {
                log.error("Batch category creation failed at index {}: {}", i, ex.getMessage());
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

        return new BatchImportResponse<>(successCount, errorCount, results);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<CategoryResponse> getAllCategories(CategoryFilterRequest filter) {
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<Category> categoryPage = categoryRepository.findAllWithFilters(
                filter.getBusinessId(),
                filter.getStatus(),
                filter.getSearch(),
                pageable
        );
        return categoryMapper.toPaginationResponse(categoryPage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<CategoryWithProductCountResponse> getCategoriesWithProductCount(CategoryFilterRequest filter) {
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<Category> categoryPage = categoryRepository.findAllWithFilters(
                filter.getBusinessId(),
                filter.getStatus(),
                filter.getSearch(),
                pageable
        );

        List<UUID> categoryIds = categoryPage.getContent().stream()
                .map(Category::getId)
                .toList();

        List<Object[]> productCountData = categoryRepository.countTotalAndActiveProductsForCategories(categoryIds);

        java.util.Map<UUID, Long> totalProductCountMap = new java.util.HashMap<>();
        java.util.Map<UUID, Long> activeProductCountMap = new java.util.HashMap<>();
        for (Object[] data : productCountData) {
            UUID categoryId = (UUID) data[0];
            totalProductCountMap.put(categoryId, ((Number) data[1]).longValue());
            activeProductCountMap.put(categoryId, ((Number) data[2]).longValue());
        }

        List<CategoryWithProductCountResponse> responses = categoryPage.getContent().stream()
                .map(category -> {
                    CategoryWithProductCountResponse response = new CategoryWithProductCountResponse();
                    CategoryResponse baseResponse = categoryMapper.toResponse(category);

                    response.setId(baseResponse.getId());
                    response.setCreatedAt(baseResponse.getCreatedAt());
                    response.setUpdatedAt(baseResponse.getUpdatedAt());
                    response.setCreatedBy(baseResponse.getCreatedBy());
                    response.setUpdatedBy(baseResponse.getUpdatedBy());
                    response.setBusinessId(baseResponse.getBusinessId());
                    response.setBusinessName(baseResponse.getBusinessName());
                    response.setName(baseResponse.getName());
                    response.setImage(baseResponse.getImage());
                    response.setStatus(baseResponse.getStatus());

                    response.setTotalProducts(totalProductCountMap.getOrDefault(category.getId(), 0L));
                    response.setActiveProducts(activeProductCountMap.getOrDefault(category.getId(), 0L));

                    return response;
                })
                .toList();

        PaginationResponse<CategoryWithProductCountResponse> paginationResponse = new PaginationResponse<>();
        paginationResponse.setContent(responses);
        paginationResponse.setPageNo(categoryPage.getNumber() + 1);
        paginationResponse.setPageSize(categoryPage.getSize());
        paginationResponse.setTotalElements(categoryPage.getTotalElements());
        paginationResponse.setTotalPages(categoryPage.getTotalPages());
        paginationResponse.setFirst(categoryPage.isFirst());
        paginationResponse.setLast(categoryPage.isLast());
        paginationResponse.setHasNext(categoryPage.hasNext());
        paginationResponse.setHasPrevious(categoryPage.hasPrevious());

        return paginationResponse;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CacheNames.CATEGORIES, key = "'list:' + #filter.businessId + ':' + #filter.status")
    public List<CategoryResponse> getAllItemCategories(CategoryAllFilterRequest filter) {
        List<Category> categories = categoryRepository.findAllWithFilters(
                filter.getBusinessId(),
                filter.getStatus(),
                filter.getSearch(),
                PaginationUtils.createSort(filter.getSortBy(), filter.getSortDirection())
        );
        return categoryMapper.toResponseList(categories);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(UUID id) {
        Category category = findCategoryById(id);
        return categoryMapper.toResponse(category);
    }

    @Override
    @CacheEvict(value = CacheNames.CATEGORIES, allEntries = true)
    public CategoryResponse updateCategory(UUID id, CategoryUpdateRequest request) {
        Category category = findCategoryById(id);

        if (request.getName() != null && !request.getName().equals(category.getName())) {
            if (categoryRepository.existsByNameAndBusinessIdAndIsDeletedFalse(
                    request.getName(), category.getBusinessId())) {
                throw new ValidationException("Category name already exists in your business");
            }
        }

        categoryMapper.updateEntity(request, category);
        Category updatedCategory = categoryRepository.save(category);

        log.info("Category updated successfully: id={}", id);
        return categoryMapper.toResponse(updatedCategory);
    }

    @Override
    @CacheEvict(value = CacheNames.CATEGORIES, allEntries = true)
    public CategoryResponse deleteCategory(UUID id) {
        Category category = findCategoryById(id);

        category.softDelete();
        category = categoryRepository.save(category);

        log.info("Category deleted successfully: id={}", id);
        return categoryMapper.toResponse(category);
    }

    private Category findCategoryById(UUID id) {
        return categoryRepository.findByIdWithBusiness(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));
    }
}