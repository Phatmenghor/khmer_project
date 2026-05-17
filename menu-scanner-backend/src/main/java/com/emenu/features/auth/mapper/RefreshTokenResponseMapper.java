package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.response.RefreshTokenResponse;
import com.emenu.features.auth.models.RefreshToken;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RefreshTokenResponseMapper {

    default RefreshTokenResponse toResponse(RefreshToken refreshToken, String accessToken) {
        return new RefreshTokenResponse(accessToken, refreshToken.getToken());
    }

    default RefreshTokenResponse toResponse(String accessToken, String refreshToken) {
        return new RefreshTokenResponse(accessToken, refreshToken);
    }
}
