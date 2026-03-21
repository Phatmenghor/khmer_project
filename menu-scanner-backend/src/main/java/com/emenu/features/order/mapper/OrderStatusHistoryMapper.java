package com.emenu.features.order.mapper;

import com.emenu.features.order.dto.response.OrderStatusHistoryResponse;
import com.emenu.features.order.models.OrderStatusHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderStatusHistoryMapper {

    @Mapping(source = "orderStatus.displayName", target = "statusName")
    @Mapping(source = "orderStatus.description", target = "statusDescription")
    @Mapping(source = "createdAt", target = "changedAt")
    OrderStatusHistoryResponse toResponse(OrderStatusHistory history);

    List<OrderStatusHistoryResponse> toResponseList(List<OrderStatusHistory> histories);
}
