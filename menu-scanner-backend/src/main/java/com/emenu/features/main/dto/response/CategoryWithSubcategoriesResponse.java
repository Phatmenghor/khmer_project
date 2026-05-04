package com.emenu.features.main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryWithSubcategoriesResponse {
    private CategoryResponse category;
    private List<SubcategoryResponse> subcategories;
}
