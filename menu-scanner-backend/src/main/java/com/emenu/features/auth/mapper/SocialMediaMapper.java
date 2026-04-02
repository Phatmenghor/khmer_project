package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.response.SocialMediaResponse;
import com.emenu.features.auth.models.SocialMedia;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

/**
 * Social Media Mapper
 * Maps between SocialMedia entity and SocialMediaResponse DTO
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SocialMediaMapper {

    SocialMediaResponse toResponse(SocialMedia socialMedia);

    SocialMedia toEntity(SocialMediaResponse response);
}
