package com.emenu.features.main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubcategoryGroupResponse {
    private List<CategoryWithSubcategoriesResponse> items;
}
