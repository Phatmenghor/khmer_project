package com.emenu.features.main.mapper;

import com.emenu.features.main.dto.request.ProductCustomizationGroupCreateDto;
import com.emenu.features.main.dto.response.ProductCustomizationGroupDto;
import com.emenu.features.main.models.ProductCustomizationGroup;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProductCustomizationGroupMapper {

    private final ProductCustomizationMapper customizationMapper;

    public ProductCustomizationGroupDto toDto(ProductCustomizationGroup group) {
        if (group == null) {
            return null;
        }

        ProductCustomizationGroupDto dto = new ProductCustomizationGroupDto();
        dto.setId(group.getId());
        dto.setProductId(group.getProductId());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());
        dto.setIsRequired(group.getIsRequired());
        dto.setAllowMultiple(group.getAllowMultiple());
        dto.setSortOrder(group.getSortOrder());
        dto.setStatus(group.getStatus());

        if (group.getCustomizations() != null) {
            dto.setCustomizations(
                group.getCustomizations().stream()
                    .map(customizationMapper::toDto)
                    .collect(Collectors.toList())
            );
        }

        return dto;
    }

    public ProductCustomizationGroup toEntity(ProductCustomizationGroupCreateDto dto) {
        if (dto == null) {
            return null;
        }

        ProductCustomizationGroup group = new ProductCustomizationGroup();
        group.setProductId(dto.getProductId());
        group.setName(dto.getName());
        group.setDescription(dto.getDescription());
        group.setIsRequired(dto.getIsRequired() != null ? dto.getIsRequired() : false);
        group.setAllowMultiple(dto.getAllowMultiple() != null ? dto.getAllowMultiple() : true);
        group.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        group.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");

        return group;
    }

    public void updateEntity(ProductCustomizationGroupCreateDto dto, ProductCustomizationGroup group) {
        if (dto == null || group == null) {
            return;
        }

        group.setName(dto.getName());
        group.setDescription(dto.getDescription());
        group.setIsRequired(dto.getIsRequired() != null ? dto.getIsRequired() : group.getIsRequired());
        group.setAllowMultiple(dto.getAllowMultiple() != null ? dto.getAllowMultiple() : group.getAllowMultiple());
        group.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : group.getSortOrder());
        group.setStatus(dto.getStatus() != null ? dto.getStatus() : group.getStatus());
    }
}
