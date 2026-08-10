package com.emenu.features.stock.mapper;

import com.emenu.features.stock.dto.response.StockMovementDto;
import com.emenu.features.stock.models.StockMovement;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface StockMovementMapper {

    StockMovementDto toDto(StockMovement movement);

    List<StockMovementDto> toDtoList(List<StockMovement> movements);
}
