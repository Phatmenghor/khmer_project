package com.emenu.features.order.mapper;

import com.emenu.features.order.dto.response.OrderItemResponse;
import com.emenu.features.order.models.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class OrderItemMapper {

    @Mapping(target = "product", expression = "java(mapProductInfo(orderItem))")
    @Mapping(target = "customizations", expression = "java(mapCustomizations(orderItem))")
    @Mapping(target = "quantity", source = "quantity")
    @Mapping(target = "currentPrice", source = "currentPrice")
    @Mapping(target = "finalPrice", source = "finalPrice")
    @Mapping(target = "totalPrice", source = "totalPrice")
    @Mapping(target = "customizationTotal", source = "customizationTotal")
    @Mapping(target = "hasPromotion", source = "hasPromotion")
    @Mapping(target = "promotionType", source = "promotionType")
    @Mapping(target = "promotionValue", source = "promotionValue")
    @Mapping(target = "promotionFromDate", source = "promotionFromDate")
    @Mapping(target = "promotionToDate", source = "promotionToDate")
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
        // Map from normalized table
        if (orderItem.getItemCustomizations() == null || orderItem.getItemCustomizations().isEmpty()) {
            return List.of();
        }

        return orderItem.getItemCustomizations().stream()
                .map(ic -> {
                    OrderItemResponse.CustomizationDetail detail = new OrderItemResponse.CustomizationDetail();
                    detail.setProductCustomizationId(ic.getProductCustomizationId());
                    detail.setName(ic.getName());
                    detail.setPriceAdjustment(ic.getPriceAdjustment());
                    return detail;
                })
                .collect(Collectors.toList());
    }
}