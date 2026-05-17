package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.response.RefreshTokenResponse;
import com.emenu.features.auth.models.RefreshToken;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RefreshTokenResponseMapper {

    @Mapping(target = "accessToken", ignore = true)
    @Mapping(target = "refreshToken", source = "token")
    RefreshTokenResponse toResponse(RefreshToken refreshToken, String accessToken);

    default RefreshTokenResponse toResponse(String accessToken, String refreshToken) {
        return new RefreshTokenResponse(accessToken, refreshToken);
    }
}
