package com.emenu.features.main.service;

import com.emenu.features.main.dto.filter.SubcategoryAllFilterRequest;
import com.emenu.features.main.dto.filter.SubcategoryFilterRequest;
import com.emenu.features.main.dto.request.SubcategoryCreateRequest;
import com.emenu.features.main.dto.response.SubcategoryResponse;
import com.emenu.features.main.dto.update.SubcategoryUpdateRequest;
import com.emenu.shared.dto.PaginationResponse;

import java.util.List;
import java.util.UUID;

public interface SubcategoryService {

    // CRUD Operations
    SubcategoryResponse createSubcategory(SubcategoryCreateRequest request);
    PaginationResponse<SubcategoryResponse> getAllSubcategories(SubcategoryFilterRequest filter);
    List<SubcategoryResponse> getAllItemSubcategories(SubcategoryAllFilterRequest filter);
    SubcategoryResponse getSubcategoryById(UUID id);
    SubcategoryResponse updateSubcategory(UUID id, SubcategoryUpdateRequest request);
    SubcategoryResponse deleteSubcategory(UUID id);
}
