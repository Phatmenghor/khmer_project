package com.emenu.features.auth.service.impl;

import com.emenu.enums.common.StockStatus;
import com.emenu.enums.common.ReceiptSize;
import com.emenu.enums.hr.ScanModeEnum;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.dto.request.BusinessSettingCreateRequest;
import com.emenu.features.auth.dto.response.BusinessSettingResponse;
import com.emenu.features.auth.dto.update.BusinessSettingUpdateRequest;
import com.emenu.features.auth.mapper.BusinessSettingMapper;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.models.BusinessHours;
import com.emenu.features.auth.models.BusinessSetting;
import com.emenu.features.auth.models.BusinessSettingDayShift;
import com.emenu.features.auth.models.SocialMedia;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.auth.repository.BusinessSettingRepository;
import com.emenu.features.auth.service.BusinessSettingService;
import com.emenu.features.hr.dto.common.DayShiftDto;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.constants.BusinessConstants;
import com.emenu.features.notification.telegram.repository.TelegramMessageLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
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
        BusinessSetting setting = businessSettingRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElseGet(() -> {
                    log.info("Business setting not found, creating settings for businessId={}", businessId);
                    
                    BusinessSetting newSetting = new BusinessSetting();
                    newSetting.setBusinessId(businessId);
                    newSetting.setTaxPercentage(BusinessConstants.DEFAULT_TAX_PERCENTAGE);
                    newSetting.setLowStockThreshold(BusinessConstants.DEFAULT_LOW_STOCK_THRESHOLD);
                    newSetting.setEnableStock(StockStatus.DISABLED);
                    newSetting.setUseBrands(true);
                    newSetting.setReceiptSize(ReceiptSize.SIZE_58MM);
                    newSetting.setStoreDescription(BusinessConstants.DEFAULT_STORE_DESCRIPTION);
                    newSetting.setEnableCheckIn(true);
                    newSetting.setScanMode(ScanModeEnum.FULL_TIME);
                    newSetting.setEnableLeaveManagement(true);
                    newSetting.setAnnualLeaveDaysPerYear(18);
                    newSetting.setSickLeaveDaysPerYear(10);
                    newSetting.setSpecialLeaveDaysPerYear(5);

                    newSetting.setBusinessHours(createDefaultBusinessHours(newSetting));
                    newSetting.setSocialMedia(createDefaultSocialMedia(newSetting));
                    newSetting.setDefaultDayShifts(createDefaultDayShifts(newSetting));

                    return businessSettingRepository.save(newSetting);
                });

        if (setting.getDefaultDayShifts() == null) {
            setting.setDefaultDayShifts(new ArrayList<>(createDefaultDayShifts(setting)));
            setting = businessSettingRepository.save(setting);
        } else if (setting.getDefaultDayShifts().isEmpty()) {
            setting.getDefaultDayShifts().addAll(createDefaultDayShifts(setting));
            setting = businessSettingRepository.save(setting);
        }

        return setting;
    }

    private List<BusinessSettingDayShift> createDefaultDayShifts(BusinessSetting setting) {
        List<BusinessSettingDayShift> defaultShifts = new ArrayList<>();
        for (DayOfWeek day : DayOfWeek.values()) {
            BusinessSettingDayShift ds = BusinessSettingDayShift.builder()
                    .businessSettingId(setting.getId())
                    .businessSetting(setting)
                    .dayOfWeek(day)
                    .enabled(false)
                    .startTime(null)
                    .endTime(null)
                    .breakStartTime(null)
                    .breakEndTime(null)
                    .enableCheckIn(false)
                    .scanMode(ScanModeEnum.FULL_TIME)
                    .build();
            defaultShifts.add(ds);
        }
        return defaultShifts;
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
        return enrichResponse(businessSettingMapper.toResponse(savedSetting), savedSetting);
    }

    @Override
    public BusinessSettingResponse getBusinessSettingByBusinessId(UUID businessId) {
        BusinessSetting businessSetting = getOrCreateBusinessSetting(businessId);
        return enrichResponse(businessSettingMapper.toResponse(businessSetting), businessSetting);
    }

    @Override
    public BusinessSettingResponse updateBusinessSetting(UUID businessId, BusinessSettingUpdateRequest request) {
        log.info("Business setting update initiated: business_id={}", businessId);

        BusinessSetting businessSetting = getOrCreateBusinessSetting(businessId);

        Business business = businessRepository.findByIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> new ValidationException("Business not found"));

        businessSettingMapper.updateEntity(request, businessSetting);

        businessSetting.setTelegramGroupChatId(request.getTelegramGroupChatId());
        businessSetting.setWifiName(request.getWifiName());
        businessSetting.setWifiPassword(request.getWifiPassword());
        businessSetting.setStoreDescription(request.getStoreDescription());

        if (request.getEnableCheckIn() != null) {
            businessSetting.setEnableCheckIn(request.getEnableCheckIn());
        }
        if (request.getScanMode() != null) {
            businessSetting.setScanMode(request.getScanMode());
        }
        if (request.getEnableLeaveManagement() != null) {
            businessSetting.setEnableLeaveManagement(request.getEnableLeaveManagement());
        }
        if (request.getAnnualLeaveDaysPerYear() != null) {
            businessSetting.setAnnualLeaveDaysPerYear(request.getAnnualLeaveDaysPerYear());
        }
        if (request.getSickLeaveDaysPerYear() != null) {
            businessSetting.setSickLeaveDaysPerYear(request.getSickLeaveDaysPerYear());
        }
        if (request.getSpecialLeaveDaysPerYear() != null) {
            businessSetting.setSpecialLeaveDaysPerYear(request.getSpecialLeaveDaysPerYear());
        }

        if (request.getDefaultDayShifts() != null && !request.getDefaultDayShifts().isEmpty()) {
            List<BusinessSettingDayShift> newShifts = request.getDefaultDayShifts().stream()
                    .map(dto -> BusinessSettingDayShift.builder()
                            .businessSettingId(businessSetting.getId())
                            .businessSetting(businessSetting)
                            .dayOfWeek(dto.getDayOfWeek())
                            .enabled(dto.getEnabled() != null ? dto.getEnabled() : false)
                            .startTime(dto.getStartTime())
                            .endTime(dto.getEndTime())
                            .breakStartTime(dto.getBreakStartTime())
                            .breakEndTime(dto.getBreakEndTime())
                            .enableCheckIn(dto.getEnableCheckIn() != null ? dto.getEnableCheckIn() : false)
                            .scanMode(dto.getScanMode() != null ? dto.getScanMode() : ScanModeEnum.FULL_TIME)
                            .build())
                    .toList();

            if (businessSetting.getDefaultDayShifts() == null) {
                businessSetting.setDefaultDayShifts(new ArrayList<>(newShifts));
            } else {
                businessSetting.getDefaultDayShifts().clear();
                businessSetting.getDefaultDayShifts().addAll(newShifts);
            }
        }

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
        return enrichResponse(businessSettingMapper.toResponse(updatedSetting), updatedSetting);
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

    private BusinessSettingResponse enrichResponse(BusinessSettingResponse response, BusinessSetting setting) {
        if (response != null && setting != null) {
            response.setEnableCheckIn(setting.getEnableCheckIn() != null ? setting.getEnableCheckIn() : true);
            response.setScanMode(setting.getScanMode() != null ? setting.getScanMode() : ScanModeEnum.FULL_TIME);
            response.setEnableLeaveManagement(setting.getEnableLeaveManagement() != null ? setting.getEnableLeaveManagement() : true);
            response.setAnnualLeaveDaysPerYear(setting.getAnnualLeaveDaysPerYear() != null ? setting.getAnnualLeaveDaysPerYear() : 18);
            response.setSickLeaveDaysPerYear(setting.getSickLeaveDaysPerYear() != null ? setting.getSickLeaveDaysPerYear() : 10);
            response.setSpecialLeaveDaysPerYear(setting.getSpecialLeaveDaysPerYear() != null ? setting.getSpecialLeaveDaysPerYear() : 5);

            if (setting.getDefaultDayShifts() != null && !setting.getDefaultDayShifts().isEmpty()) {
                List<DayShiftDto> dtos = setting.getDefaultDayShifts().stream()
                        .map(s -> DayShiftDto.builder()
                                .dayOfWeek(s.getDayOfWeek())
                                .enabled(s.getEnabled() != null ? s.getEnabled() : false)
                                .startTime(s.getStartTime())
                                .endTime(s.getEndTime())
                                .breakStartTime(s.getBreakStartTime())
                                .breakEndTime(s.getBreakEndTime())
                                .enableCheckIn(s.getEnableCheckIn() != null ? s.getEnableCheckIn() : false)
                                .scanMode(s.getScanMode() != null ? s.getScanMode() : ScanModeEnum.FULL_TIME)
                                .build())
                        .toList();
                response.setDefaultDayShifts(dtos);
            }
        }
        return response;
    }
}
