package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.request.SocialMediaRequest;
import com.emenu.features.auth.dto.response.SocialMediaResponse;
import com.emenu.features.auth.models.SocialMedia;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

/**
 * Social Media Mapper
 * Maps between SocialMedia entity and SocialMediaResponse/SocialMediaRequest DTOs
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SocialMediaMapper {

    // To Response DTO
    SocialMediaResponse toResponse(SocialMedia socialMedia);

    // From Response DTO
    SocialMedia toEntity(SocialMediaResponse response);

    // From Request DTO
    SocialMedia toEntity(SocialMediaRequest request);

    // To Request DTO
    SocialMediaRequest toRequest(SocialMedia socialMedia);
}
