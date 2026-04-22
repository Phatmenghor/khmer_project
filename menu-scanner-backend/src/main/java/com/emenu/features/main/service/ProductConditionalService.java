package com.emenu.features.main.service;

import com.emenu.features.auth.models.BusinessSetting;
import com.emenu.features.auth.service.BusinessSettingService;
import com.emenu.features.main.dto.response.ProductDetailDto;
import com.emenu.features.main.dto.response.ProductListDto;
import com.emenu.features.main.dto.response.ProductResponseDto;
import com.emenu.features.main.models.Product;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductConditionalService {

    private final BusinessSettingService businessSettingService;

    /**
     * Convert Product to ProductDetailDto and apply business settings filters
     */
    public ProductDetailDto convertProductToDetailDto(Product product, UUID businessId) {
        ProductDetailDto dto = convertProductToDetailDtoInternal(product);

        // Get business settings and apply visibility rules
        BusinessSetting settings = businessSettingService.getBusinessSettings(businessId);
        if (settings != null) {
            applyBusinessSettingsToDetailDto(dto, settings);
        }

        return dto;
    }

    /**
     * Convert Product to ProductListDto and apply business settings filters
     */
    public ProductListDto convertProductToListDto(Product product, UUID businessId) {
        ProductListDto dto = convertProductToListDtoInternal(product);

        // Get business settings and apply visibility rules
        BusinessSetting settings = businessSettingService.getBusinessSettings(businessId);
        if (settings != null) {
            applyBusinessSettingsToListDto(dto, settings);
        }

        return dto;
    }

    /**
     * Apply business settings to ProductDetailDto
     */
    private void applyBusinessSettingsToDetailDto(ProductDetailDto dto, BusinessSetting settings) {
        if (settings.getUseCategories() == null || !settings.getUseCategories()) {
            dto.setCategoryId(null);
            dto.setCategoryName(null);
        }

        if (settings.getUseSubcategories() == null || !settings.getUseSubcategories()) {
            // subcategoryId and subcategoryName not in ProductDetailDto yet, but prepare for future
        }

        if (settings.getUseBrands() == null || !settings.getUseBrands()) {
            dto.setBrandId(null);
            dto.setBrandName(null);
        }
    }

    /**
     * Apply business settings to ProductListDto
     */
    private void applyBusinessSettingsToListDto(ProductListDto dto, BusinessSetting settings) {
        if (settings.getUseCategories() == null || !settings.getUseCategories()) {
            dto.setCategoryId(null);
            dto.setCategoryName(null);
        }

        if (settings.getUseSubcategories() == null || !settings.getUseSubcategories()) {
            // subcategoryId and subcategoryName not in ProductListDto yet, but prepare for future
        }

        if (settings.getUseBrands() == null || !settings.getUseBrands()) {
            dto.setBrandId(null);
            dto.setBrandName(null);
        }
    }

    /**
     * Internal conversion - just map Product to DTO without business settings
     */
    private ProductDetailDto convertProductToDetailDtoInternal(Product product) {
        ProductDetailDto dto = new ProductDetailDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setStatus(product.getStatus());
        dto.setPrice(product.getPrice());
        dto.setPromotionType(product.getPromotionType() != null ? product.getPromotionType().name() : null);
        dto.setPromotionValue(product.getPromotionValue());
        dto.setPromotionFromDate(product.getPromotionFromDate());
        dto.setPromotionToDate(product.getPromotionToDate());
        dto.setDisplayPrice(product.getDisplayPrice());
        dto.setDisplayOriginPrice(product.getDisplayOriginPrice());
        dto.setDisplayPromotionType(product.getDisplayPromotionType() != null ? product.getDisplayPromotionType().name() : null);
        dto.setDisplayPromotionValue(product.getDisplayPromotionValue());
        dto.setDisplayPromotionFromDate(product.getDisplayPromotionFromDate());
        dto.setDisplayPromotionToDate(product.getDisplayPromotionToDate());
        dto.setHasSizes(product.getHasSizes());
        dto.setHasPromotion(product.getHasActivePromotion());
        dto.setMainImageUrl(product.getMainImageUrl());
        dto.setBarcode(product.getBarcode());
        dto.setSku(product.getSku());
        dto.setStockStatus(product.getStockStatus());
        dto.setViewCount(product.getViewCount());
        dto.setFavoriteCount(product.getFavoriteCount());
        dto.setBusinessId(product.getBusinessId());
        dto.setBusinessName(product.getBusinessName());
        dto.setCategoryId(product.getCategoryId());
        dto.setCategoryName(product.getCategoryName());
        dto.setBrandId(product.getBrandId());
        dto.setBrandName(product.getBrandName());

        return dto;
    }

    /**
     * Internal conversion - just map Product to DTO without business settings
     */
    private ProductListDto convertProductToListDtoInternal(Product product) {
        ProductListDto dto = new ProductListDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        dto.setDisplayPrice(product.getDisplayPrice());
        dto.setDisplayOriginPrice(product.getDisplayOriginPrice());
        dto.setMainImageUrl(product.getMainImageUrl());
        dto.setBusinessId(product.getBusinessId());
        dto.setBusinessName(product.getBusinessName());
        dto.setCategoryId(product.getCategoryId());
        dto.setCategoryName(product.getCategoryName());
        dto.setBrandId(product.getBrandId());
        dto.setBrandName(product.getBrandName());
        dto.setHasActivePromotion(product.getHasActivePromotion());
        dto.setStatus(product.getStatus());

        return dto;
    }

    /**
     * Check if business uses categories
     */
    public boolean businessUsesCategories(UUID businessId) {
        BusinessSetting settings = businessSettingService.getBusinessSettings(businessId);
        return settings != null && (settings.getUseCategories() == null || settings.getUseCategories());
    }

    /**
     * Check if business uses subcategories
     */
    public boolean businessUsesSubcategories(UUID businessId) {
        BusinessSetting settings = businessSettingService.getBusinessSettings(businessId);
        return settings != null && (settings.getUseSubcategories() != null && settings.getUseSubcategories());
    }

    /**
     * Check if business uses brands
     */
    public boolean businessUsesBrands(UUID businessId) {
        BusinessSetting settings = businessSettingService.getBusinessSettings(businessId);
        return settings != null && (settings.getUseBrands() != null && settings.getUseBrands());
    }
}
