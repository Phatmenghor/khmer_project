package com.emenu.features.master.mapper;

import com.emenu.features.master.dto.request.PlatformProfileRequest;
import com.emenu.features.master.dto.response.PlatformProfileResponse;
import com.emenu.features.master.models.PlatformProfile;
import org.springframework.stereotype.Component;

@Component
public class PlatformProfileMapper {

    public PlatformProfileResponse toResponse(PlatformProfile entity) {
        if (entity == null) return null;

        return PlatformProfileResponse.builder()
                .id(entity.getId())
                .brandName(entity.getBrandName())
                .brandSlogan(entity.getBrandSlogan())
                .supportEmail(entity.getSupportEmail())
                .supportTelegram(entity.getSupportTelegram())
                .supportPhone(entity.getSupportPhone())
                .address(entity.getAddress())
                .description(entity.getDescription())
                .logoUrl(entity.getLogoUrl())
                .facebookUrl(entity.getFacebookUrl())
                .websiteUrl(entity.getWebsiteUrl())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public void updateEntity(PlatformProfile entity, PlatformProfileRequest request) {
        if (entity == null || request == null) return;

        if (request.getBrandName() != null) entity.setBrandName(request.getBrandName());
        if (request.getBrandSlogan() != null) entity.setBrandSlogan(request.getBrandSlogan());
        if (request.getSupportEmail() != null) entity.setSupportEmail(request.getSupportEmail());
        if (request.getSupportTelegram() != null) entity.setSupportTelegram(request.getSupportTelegram());
        if (request.getSupportPhone() != null) entity.setSupportPhone(request.getSupportPhone());
        if (request.getAddress() != null) entity.setAddress(request.getAddress());
        if (request.getDescription() != null) entity.setDescription(request.getDescription());
        if (request.getLogoUrl() != null) entity.setLogoUrl(request.getLogoUrl());
        if (request.getFacebookUrl() != null) entity.setFacebookUrl(request.getFacebookUrl());
        if (request.getWebsiteUrl() != null) entity.setWebsiteUrl(request.getWebsiteUrl());
    }
}
