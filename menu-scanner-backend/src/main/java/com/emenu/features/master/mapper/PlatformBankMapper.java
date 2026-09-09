package com.emenu.features.master.mapper;

import com.emenu.features.master.dto.request.PlatformBankRequest;
import com.emenu.features.master.dto.response.PlatformBankResponse;
import com.emenu.features.master.models.PlatformBank;
import com.emenu.shared.mapper.PaginationMapper;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PaginationMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PlatformBankMapper {

    PlatformBank toEntity(PlatformBankRequest request);

    PlatformBankResponse toResponse(PlatformBank bank);

    List<PlatformBankResponse> toResponseList(List<PlatformBank> banks);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(PlatformBankRequest request, @MappingTarget PlatformBank bank);
}
