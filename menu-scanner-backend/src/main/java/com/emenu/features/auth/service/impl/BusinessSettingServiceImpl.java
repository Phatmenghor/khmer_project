package com.emenu.features.auth.service.impl;

import com.emenu.exception.custom.ValidationException;
import com.emenu.shared.constants.CacheNames;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import com.emenu.features.auth.dto.request.BusinessSettingCreateRequest;
import com.emenu.features.auth.dto.response.BusinessSettingResponse;
import com.emenu.features.auth.dto.update.BusinessSettingUpdateRequest;
import com.emenu.features.auth.mapper.BusinessSettingMapper;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.models.BusinessSetting;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.auth.repository.BusinessSettingRepository;
import com.emenu.features.auth.service.BusinessSettingService;
import com.emenu.security.SecurityUtils;
import com.emenu.features.notification.telegram.repository.TelegramMessageLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional(readOnly = true)
    @Cacheable(value = CacheNames.BUSINESS_SETTINGS, key = "#businessId")
    public BusinessSettingResponse getBusinessSettingByBusinessId(UUID businessId) {
        BusinessSetting businessSetting = businessSettingRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> new ValidationException("Business setting not found"));
        return businessSettingMapper.toResponse(businessSetting);
    }

    @Override
    @CacheEvict(value = CacheNames.BUSINESS_SETTINGS, key = "#businessId")
    public BusinessSettingResponse updateBusinessSetting(UUID businessId, BusinessSettingUpdateRequest request) {
        log.info("Business setting update initiated: business_id={}", businessId);

        BusinessSetting businessSetting = businessSettingRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> new ValidationException("Business setting not found"));

        Business business = businessRepository.findByIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> new ValidationException("Business not found"));

        businessSettingMapper.updateEntity(request, businessSetting);

        // Explicitly set telegramGroupChatId to support updating and clearing it
        businessSetting.setTelegramGroupChatId(request.getTelegramGroupChatId());

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
    @Transactional(readOnly = true)
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
