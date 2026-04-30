package com.emenu.features.order.mapper;

import com.emenu.features.order.dto.response.OrderItemResponse;
import com.emenu.features.order.models.OrderItem;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class OrderItemMapper {

    @Autowired
    protected ObjectMapper objectMapper;

    @Mapping(target = "product", expression = "java(mapProductInfo(orderItem))")
    @Mapping(target = "customizations", expression = "java(mapCustomizations(orderItem))")
    @Mapping(target = "customizationTotal", source = "customizationTotal")
    public abstract OrderItemResponse toResponse(OrderItem orderItem);

    public abstract List<OrderItemResponse> toResponseList(List<OrderItem> orderItems);

    protected OrderItemResponse.OrderItemProductInfo mapProductInfo(OrderItem orderItem) {
        if (orderItem.getProduct() == null) {
            return null;
        }

        OrderItemResponse.OrderItemProductInfo info = new OrderItemResponse.OrderItemProductInfo();
        info.setId(orderItem.getProduct().getId());
        info.setName(orderItem.getProductName());
        info.setImageUrl(orderItem.getProductImageUrl());
        info.setSku(orderItem.getSku());
        info.setBarcode(orderItem.getBarcode());
        info.setSizeId(orderItem.getProductSizeId());
        info.setSizeName(orderItem.getSizeName());
        if (orderItem.getProduct().getStatus() != null) {
            info.setStatus(orderItem.getProduct().getStatus().toString());
        }
        return info;
    }

    protected List<OrderItemResponse.CustomizationDetail> mapCustomizations(OrderItem orderItem) {
        if (orderItem.getCustomizations() == null || orderItem.getCustomizations().isEmpty()) {
            return List.of();
        }

        try {
            java.util.List<?> customizationsList = objectMapper.readValue(orderItem.getCustomizations(), java.util.List.class);
            return customizationsList.stream()
                    .map(c -> {
                        if (c instanceof java.util.Map) {
                            java.util.Map<String, Object> map = (java.util.Map<String, Object>) c;
                            OrderItemResponse.CustomizationDetail detail = new OrderItemResponse.CustomizationDetail();
                            detail.setProductCustomizationId(java.util.UUID.fromString(map.get("productCustomizationId").toString()));
                            detail.setName(map.get("name").toString());
                            detail.setPriceAdjustment(new java.math.BigDecimal(map.get("priceAdjustment").toString()));
                            return detail;
                        }
                        return null;
                    })
                    .filter(item -> item != null)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            return List.of();
        }
    }
}