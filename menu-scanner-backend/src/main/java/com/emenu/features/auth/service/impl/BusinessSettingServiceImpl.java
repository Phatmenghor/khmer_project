package com.emenu.features.auth.service.impl;

import com.emenu.enums.common.StockStatus;
import com.emenu.enums.common.ReceiptSize;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.dto.request.BusinessSettingCreateRequest;
import com.emenu.features.auth.dto.response.BusinessSettingResponse;
import com.emenu.features.auth.dto.update.BusinessSettingUpdateRequest;
import com.emenu.features.auth.mapper.BusinessSettingMapper;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.models.BusinessHours;
import com.emenu.features.auth.models.BusinessSetting;
import com.emenu.features.auth.models.SocialMedia;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.auth.repository.BusinessSettingRepository;
import com.emenu.features.auth.service.BusinessSettingService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.constants.BusinessConstants;
import com.emenu.features.notification.telegram.repository.TelegramMessageLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BusinessSettingServiceImpl implements BusinessSettingService {

    private final BusinessSettingRepository businessSettingRepository;
    private final BusinessRepository businessRepository;
    private final BusinessSettingMapper businessSettingMapper;
    private final SecurityUtils securityUtils;
    private final TelegramMessageLogRepository telegramMessageLogRepository;

    private BusinessSetting getOrCreateBusinessSetting(UUID businessId) {
        return businessSettingRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElseGet(() -> {
                    log.info("Business setting not found, creating default settings for businessId={}", businessId);
                    
                    BusinessSetting newSetting = new BusinessSetting();
                    newSetting.setBusinessId(businessId);
                    newSetting.setTaxPercentage(BusinessConstants.DEFAULT_TAX_PERCENTAGE);
                    newSetting.setLowStockThreshold(BusinessConstants.DEFAULT_LOW_STOCK_THRESHOLD);
                    newSetting.setEnableStock(StockStatus.DISABLED);
                    newSetting.setUseBrands(true);
                    newSetting.setReceiptSize(ReceiptSize.SIZE_58MM);
                    newSetting.setStoreDescription(BusinessConstants.DEFAULT_STORE_DESCRIPTION);

                    BusinessSetting savedSetting = businessSettingRepository.save(newSetting);

                    savedSetting.setBusinessHours(createDefaultBusinessHours(savedSetting));
                    savedSetting.setSocialMedia(createDefaultSocialMedia(savedSetting));

                    return businessSettingRepository.save(savedSetting);
                });
    }

    private List<BusinessHours> createDefaultBusinessHours(BusinessSetting setting) {
        List<BusinessHours> defaultHours = new ArrayList<>();
        for (String[] cfg : BusinessConstants.DEFAULT_BUSINESS_HOURS_CONFIG) {
            BusinessHours bh = new BusinessHours();
            bh.setBusinessSettingId(setting.getId());
            bh.setBusinessSetting(setting);
            bh.setDay(cfg[0]);
            bh.setOpeningTime(cfg[1]);
            bh.setClosingTime(cfg[2]);
            defaultHours.add(bh);
        }
        return defaultHours;
    }

    private List<SocialMedia> createDefaultSocialMedia(BusinessSetting setting) {
        List<SocialMedia> defaultSocials = new ArrayList<>();
        for (String[] sc : BusinessConstants.DEFAULT_SOCIAL_MEDIA_CONFIG) {
            SocialMedia sm = new SocialMedia();
            sm.setBusinessSettingId(setting.getId());
            sm.setBusinessSetting(setting);
            sm.setName(sc[0]);
            sm.setLinkUrl(sc[1]);
            defaultSocials.add(sm);
        }
        return defaultSocials;
    }

    @Override
    public BusinessSettingResponse createBusinessSetting(BusinessSettingCreateRequest request) {
        log.info("Business setting creation initiated: business_id={}", request.getBusinessId());

        Business business = businessRepository.findByIdAndIsDeletedFalse(request.getBusinessId())
                .orElseThrow(() -> new ValidationException("Business not found"));

        if (businessSettingRepository.existsByBusinessIdAndIsDeletedFalse(request.getBusinessId())) {
            throw new ValidationException("Business setting already exists for this business");
        }

        BusinessSetting businessSetting = businessSettingMapper.toEntity(request);
        BusinessSetting savedSetting = businessSettingRepository.save(businessSetting);

        log.info("Business setting created successfully: business_id={}", business.getId());
        return businessSettingMapper.toResponse(savedSetting);
    }

    @Override
    public BusinessSettingResponse getBusinessSettingByBusinessId(UUID businessId) {
        BusinessSetting businessSetting = getOrCreateBusinessSetting(businessId);
        return businessSettingMapper.toResponse(businessSetting);
    }

    @Override
    public BusinessSettingResponse updateBusinessSetting(UUID businessId, BusinessSettingUpdateRequest request) {
        log.info("Business setting update initiated: business_id={}", businessId);

        BusinessSetting businessSetting = getOrCreateBusinessSetting(businessId);

        Business business = businessRepository.findByIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> new ValidationException("Business not found"));

        businessSettingMapper.updateEntity(request, businessSetting);

        // Explicitly set telegramGroupChatId to support updating and clearing it
        businessSetting.setTelegramGroupChatId(request.getTelegramGroupChatId());

        // Explicitly set wifiName and wifiPassword to support updating and clearing
        businessSetting.setWifiName(request.getWifiName());
        businessSetting.setWifiPassword(request.getWifiPassword());
        businessSetting.setStoreDescription(request.getStoreDescription());

        // Update Business entity with contact information if provided
        if (request.getBusinessName() != null) {
            business.setName(request.getBusinessName());
        }
        if (request.getContactAddress() != null) {
            business.setDescription(request.getContactAddress());
        }
        if (request.getContactPhone() != null) {
            business.setPhone(request.getContactPhone());
        }
        if (request.getContactEmail() != null) {
            business.setEmail(request.getContactEmail());
        }

        businessRepository.save(business);
        BusinessSetting updatedSetting = businessSettingRepository.save(businessSetting);

        log.info("Business setting updated successfully: business_id={}", businessId);
        return businessSettingMapper.toResponse(updatedSetting);
    }

    @Override
    public void deleteBusinessSetting(UUID businessId) {
        BusinessSetting businessSetting = businessSettingRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> new ValidationException("Business setting not found"));

        businessSetting.softDelete();
        businessSettingRepository.save(businessSetting);
        log.info("Business setting deleted successfully: business_id={}", businessId);
    }

    @Override
    public BusinessSettingResponse getCurrentBusinessSetting() {
        User currentUser = securityUtils.getCurrentUser();

        if (currentUser.getBusinessId() == null) {
            throw new ValidationException("User is not associated with any business");
        }

        return getBusinessSettingByBusinessId(currentUser.getBusinessId());
    }

    @Override
    public BusinessSettingResponse updateCurrentBusinessSetting(BusinessSettingUpdateRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        if (currentUser.getBusinessId() == null) {
            throw new ValidationException("User is not associated with any business");
        }

        log.info("Business setting self-update initiated: user_id={}, business_id={}", currentUser.getId(), currentUser.getBusinessId());
        return updateBusinessSetting(currentUser.getBusinessId(), request);
    }
}
