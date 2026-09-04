package com.emenu.features.order.mapper;

import com.emenu.enums.order.TableStatus;
import com.emenu.features.order.dto.request.CreateTableRequest;
import com.emenu.features.order.dto.response.DiningTableResponse;
import com.emenu.features.order.models.DiningTable;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, imports = { TableStatus.class })
public interface DiningTableMapper {

    @Mapping(target = "seatedMinutes", expression = "java(calculateSeatedMinutes(table))")
    DiningTableResponse toResponse(DiningTable table);

    List<DiningTableResponse> toResponseList(List<DiningTable> tables);

    @Mapping(target = "name", source = "number")
    @Mapping(target = "status", expression = "java(TableStatus.AVAILABLE)")
    DiningTable toEntity(CreateTableRequest request);

    default Long calculateSeatedMinutes(DiningTable table) {
        if (table == null || table.getSeatedAt() == null) return null;
        return Duration.between(table.getSeatedAt(), LocalDateTime.now()).toMinutes();
    }
}
