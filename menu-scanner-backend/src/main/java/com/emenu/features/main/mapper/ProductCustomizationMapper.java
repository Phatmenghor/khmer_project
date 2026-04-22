package com.emenu.features.main.mapper;

import com.emenu.features.main.dto.request.ProductCustomizationCreateDto;
import com.emenu.features.main.dto.response.ProductCustomizationDto;
import com.emenu.features.main.models.ProductCustomization;
import org.springframework.stereotype.Component;

@Component
public class ProductCustomizationMapper {

    public ProductCustomizationDto toDto(ProductCustomization customization) {
        if (customization == null) {
            return null;
        }

        ProductCustomizationDto dto = new ProductCustomizationDto();
        dto.setId(customization.getId());
        dto.setProductCustomizationGroupId(customization.getProductCustomizationGroupId());
        dto.setName(customization.getName());
        dto.setDescription(customization.getDescription());
        dto.setPriceAdjustment(customization.getPriceAdjustment());
        dto.setSortOrder(customization.getSortOrder());
        dto.setStatus(customization.getStatus());

        return dto;
    }

    public ProductCustomization toEntity(ProductCustomizationCreateDto dto) {
        if (dto == null) {
            return null;
        }

        ProductCustomization customization = new ProductCustomization();
        customization.setProductCustomizationGroupId(dto.getProductCustomizationGroupId());
        customization.setName(dto.getName());
        customization.setDescription(dto.getDescription());
        customization.setPriceAdjustment(dto.getPriceAdjustment());
        customization.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        customization.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");

        return customization;
    }

    public void updateEntity(ProductCustomizationCreateDto dto, ProductCustomization customization) {
        if (dto == null || customization == null) {
            return;
        }

        customization.setName(dto.getName());
        customization.setDescription(dto.getDescription());
        customization.setPriceAdjustment(dto.getPriceAdjustment());
        customization.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : customization.getSortOrder());
        customization.setStatus(dto.getStatus() != null ? dto.getStatus() : customization.getStatus());
    }
}
