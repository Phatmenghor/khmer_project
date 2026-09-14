package com.emenu.features.bakong.mapper;

import com.emenu.features.bakong.dto.BakongAccountCreateRequest;
import com.emenu.features.bakong.dto.BakongAccountResponse;
import com.emenu.features.bakong.dto.BakongAccountUpdateRequest;
import com.emenu.features.bakong.model.BakongAccount;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BakongAccountMapper {

    BakongAccountResponse toResponse(BakongAccount account);

    BakongAccount toEntity(BakongAccountCreateRequest request);

    void updateEntityFromRequest(BakongAccountUpdateRequest request, @MappingTarget BakongAccount account);
}
