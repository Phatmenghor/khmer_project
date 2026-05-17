package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.request.SocialMediaRequest;
import com.emenu.features.auth.dto.response.SocialMediaResponse;
import com.emenu.features.auth.models.SocialMedia;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SocialMediaMapper {

    SocialMediaResponse toResponse(SocialMedia socialMedia);

    SocialMedia toEntity(SocialMediaResponse response);

    SocialMedia toEntity(SocialMediaRequest request);

    SocialMediaRequest toRequest(SocialMedia socialMedia);
}
