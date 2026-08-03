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
        return true;
    }

    public boolean businessUsesBrands(UUID businessId) {
        if (businessId == null) {
            return true;
        }
        try {
            BusinessSettingResponse settings = businessSettingService.getBusinessSettingByBusinessId(businessId);
            return settings == null || settings.getUseBrands() == null || settings.getUseBrands();
        } catch (Exception ex) {
            log.warn("Business setting not found for businessId={}. Defaulting useBrands to true.", businessId);
            return true;
        }
    }
}
