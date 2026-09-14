package com.emenu.features.bakong.mapper;

import com.emenu.features.bakong.dto.BakongConfigCreateRequest;
import com.emenu.features.bakong.dto.BakongConfigResponse;
import com.emenu.features.bakong.dto.BakongConfigUpdateRequest;
import com.emenu.features.bakong.model.BakongConfig;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BakongConfigMapper {

    BakongConfigResponse toResponse(BakongConfig config);

    BakongConfig toEntity(BakongConfigCreateRequest request);

    void updateEntityFromRequest(BakongConfigUpdateRequest request, @MappingTarget BakongConfig config);
}
