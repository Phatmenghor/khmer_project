package com.emenu.features.master.service.impl;

import com.emenu.features.master.dto.request.PlatformProfileRequest;
import com.emenu.features.master.dto.response.PlatformProfileResponse;
import com.emenu.features.master.mapper.PlatformProfileMapper;
import com.emenu.features.master.models.PlatformProfile;
import com.emenu.features.master.repository.PlatformProfileRepository;
import com.emenu.features.master.service.PlatformProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlatformProfileServiceImpl implements PlatformProfileService {

    private static final String BRAND_NAME = "ScanMe KH";
    private static final String BRAND_SLOGAN = "Digital Menu & Smart POS Platform";
    private static final String SUPPORT_EMAIL = "phatmenghor7@gmail.com";
    private static final String SUPPORT_TELEGRAM = "070411260";

    private final PlatformProfileRepository platformProfileRepository;
    private final PlatformProfileMapper platformProfileMapper;

    @Override
    @Transactional
    public PlatformProfileResponse getPlatformProfile() {
        PlatformProfile profile = getOrCreateDefaultProfile();
        return platformProfileMapper.toResponse(profile);
    }

    @Override
    @Transactional
    public PlatformProfileResponse updatePlatformProfile(PlatformProfileRequest request) {
        PlatformProfile profile = getOrCreateDefaultProfile();
        platformProfileMapper.updateEntity(profile, request);
        PlatformProfile updated = platformProfileRepository.save(profile);
        log.info("Platform profile updated successfully. ID: {}", updated.getId());
        return platformProfileMapper.toResponse(updated);
    }

    private PlatformProfile getOrCreateDefaultProfile() {
        return platformProfileRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> {
                    log.info("No platform profile found. Seeding default brand profile.");
                    PlatformProfile defaultProfile = PlatformProfile.builder()
                            .brandName(BRAND_NAME)
                            .brandSlogan(BRAND_SLOGAN)
                            .supportEmail(SUPPORT_EMAIL)
                            .supportTelegram(SUPPORT_TELEGRAM)
                            .supportPhone("070411260")
                            .description("ScanMe KH - Premier Digital Menu and Smart POS Solution for Restaurants, Cafes, and Businesses.")
                            .build();
                    return platformProfileRepository.save(defaultProfile);
                });
    }
}
