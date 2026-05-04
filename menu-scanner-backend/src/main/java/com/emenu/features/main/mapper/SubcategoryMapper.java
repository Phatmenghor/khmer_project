package com.emenu.features.main.mapper;

import com.emenu.features.main.dto.request.SubcategoryCreateRequest;
import com.emenu.features.main.dto.response.SubcategoryResponse;
import com.emenu.features.main.dto.update.SubcategoryUpdateRequest;
import com.emenu.features.main.models.Subcategory;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import org.mapstruct.*;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PaginationMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SubcategoryMapper {

    Subcategory toEntity(SubcategoryCreateRequest request);

    @Mapping(source = "business.name", target = "businessName")
    @Mapping(source = "category.name", target = "categoryName")
    SubcategoryResponse toResponse(Subcategory subcategory);

    List<SubcategoryResponse> toResponseList(List<Subcategory> subcategories);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(SubcategoryUpdateRequest request, @MappingTarget Subcategory subcategory);

    default PaginationResponse<SubcategoryResponse> toPaginationResponse(Page<Subcategory> subcategoryPage, PaginationMapper paginationMapper) {
        return paginationMapper.toPaginationResponse(subcategoryPage, this::toResponseList);
    }
}
