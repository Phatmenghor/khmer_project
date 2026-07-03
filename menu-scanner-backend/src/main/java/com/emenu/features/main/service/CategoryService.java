package com.emenu.features.main.service;

import com.emenu.features.main.dto.filter.CategoryAllFilterRequest;
import com.emenu.features.main.dto.filter.CategoryFilterRequest;
import com.emenu.features.main.dto.request.CategoryCreateRequest;
import com.emenu.features.main.dto.response.CategoryResponse;
import com.emenu.features.main.dto.response.CategoryWithProductCountResponse;
import com.emenu.features.main.dto.update.CategoryUpdateRequest;
import com.emenu.shared.dto.PaginationResponse;

import java.util.List;
import java.util.UUID;

import com.emenu.shared.dto.BatchImportResponse;

public interface CategoryService {
    
    // CRUD Operations
    CategoryResponse createCategory(CategoryCreateRequest request);
    BatchImportResponse<CategoryResponse> createCategoryBatch(List<CategoryCreateRequest> requests);
    PaginationResponse<CategoryResponse> getAllCategories(CategoryFilterRequest filter);
    PaginationResponse<CategoryWithProductCountResponse> getCategoriesWithProductCount(CategoryFilterRequest filter);
    List<CategoryResponse> getAllItemCategories(CategoryAllFilterRequest filter);
    CategoryResponse getCategoryById(UUID id);
    CategoryResponse updateCategory(UUID id, CategoryUpdateRequest request);
    CategoryResponse deleteCategory(UUID id);
}