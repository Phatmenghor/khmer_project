package com.emenu.features.main.service;

import com.emenu.features.auth.dto.response.BusinessSettingResponse;
import com.emenu.features.auth.service.BusinessSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductConditionalService {

    private final BusinessSettingService businessSettingService;

    public boolean businessUsesCategories(UUID businessId) {
        BusinessSettingResponse settings = businessSettingService.getBusinessSettingByBusinessId(businessId);
        return settings != null && (settings.getUseCategories() == null || settings.getUseCategories());
    }

    public boolean businessUsesSubcategories(UUID businessId) {
        BusinessSettingResponse settings = businessSettingService.getBusinessSettingByBusinessId(businessId);
        return settings != null && (settings.getUseSubcategories() != null && settings.getUseSubcategories());
    }

    public boolean businessUsesBrands(UUID businessId) {
        BusinessSettingResponse settings = businessSettingService.getBusinessSettingByBusinessId(businessId);
        return settings != null && (settings.getUseBrands() != null && settings.getUseBrands());
    }
}
