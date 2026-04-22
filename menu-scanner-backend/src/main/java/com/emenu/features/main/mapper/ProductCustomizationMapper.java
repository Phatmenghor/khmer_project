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
        dto.setProductId(customization.getProductId());
        dto.setName(customization.getName());
        dto.setPriceAdjustment(customization.getPriceAdjustment());
        dto.setStatus(customization.getStatus());

        return dto;
    }

    public ProductCustomization toEntity(ProductCustomizationCreateDto dto) {
        if (dto == null) {
            return null;
        }

        ProductCustomization customization = new ProductCustomization();
        customization.setProductId(dto.getProductId());
        customization.setName(dto.getName());
        customization.setPriceAdjustment(dto.getPriceAdjustment());
        customization.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");

        return customization;
    }

    public void updateEntity(ProductCustomizationCreateDto dto, ProductCustomization customization) {
        if (dto == null || customization == null) {
            return;
        }

        customization.setName(dto.getName());
        customization.setPriceAdjustment(dto.getPriceAdjustment());
        customization.setStatus(dto.getStatus() != null ? dto.getStatus() : customization.getStatus());
    }
}
