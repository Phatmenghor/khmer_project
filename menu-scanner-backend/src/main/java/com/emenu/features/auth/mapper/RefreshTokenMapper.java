package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.helper.RefreshTokenCreateHelper;
import com.emenu.features.auth.models.RefreshToken;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RefreshTokenMapper {

    RefreshToken createFromHelper(RefreshTokenCreateHelper helper);
}
