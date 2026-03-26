package com.emenu.features.order.mapper;

import com.emenu.features.order.dto.response.OrderItemPricingSnapshot;
import com.emenu.features.order.dto.response.OrderItemResponse;
import com.emenu.features.order.models.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderItemMapper {

    @Mapping(target = "product", expression = "java(mapProductInfo(orderItem))")
    @Mapping(target = "before", expression = "java(mapBeforeSnapshot(orderItem))")
    @Mapping(target = "after", expression = "java(mapAfterSnapshot(orderItem))")
    @Mapping(target = "auditMetadata", ignore = true)  // Stored as JSON string, handle separately if needed
    OrderItemResponse toResponse(OrderItem orderItem);

    List<OrderItemResponse> toResponseList(List<OrderItem> orderItems);

    default OrderItemResponse.OrderItemProductInfo mapProductInfo(OrderItem orderItem) {
        if (orderItem.getProduct() == null) {
            return null;
        }

        OrderItemResponse.OrderItemProductInfo info = new OrderItemResponse.OrderItemProductInfo();
        info.setId(orderItem.getProduct().getId());
        info.setName(orderItem.getProductName());
        info.setImageUrl(orderItem.getProductImageUrl());
        info.setSizeId(orderItem.getProductSizeId());
        info.setSizeName(orderItem.getSizeName());
        if (orderItem.getProduct().getStatus() != null) {
            info.setStatus(orderItem.getProduct().getStatus().toString());
        }
        return info;
    }

    default OrderItemPricingSnapshot mapBeforeSnapshot(OrderItem orderItem) {
        // Build before snapshot from current pricing
        // For orders without explicit audit trail, use current prices as before state
        OrderItemPricingSnapshot snapshot = new OrderItemPricingSnapshot();
        snapshot.setCurrentPrice(orderItem.getCurrentPrice() != null ? orderItem.getCurrentPrice() : BigDecimal.ZERO);
        snapshot.setFinalPrice(orderItem.getCurrentPrice() != null ? orderItem.getCurrentPrice() : BigDecimal.ZERO);
        snapshot.setHasActivePromotion(orderItem.getHasPromotion() != null ? orderItem.getHasPromotion() : false);
        snapshot.setQuantity(orderItem.getQuantity() != null ? orderItem.getQuantity() : 0);
        snapshot.setTotalBeforeDiscount(calculateTotalBeforeDiscount(orderItem));
        snapshot.setDiscountAmount(BigDecimal.ZERO);
        snapshot.setTotalPrice(calculateTotalBeforeDiscount(orderItem));
        snapshot.setPromotionType(orderItem.getPromotionType());
        snapshot.setPromotionValue(orderItem.getPromotionValue());
        snapshot.setPromotionFromDate(orderItem.getPromotionFromDate());
        snapshot.setPromotionToDate(orderItem.getPromotionToDate());
        return snapshot;
    }

    default OrderItemPricingSnapshot mapAfterSnapshot(OrderItem orderItem) {
        // Build after snapshot with final pricing
        OrderItemPricingSnapshot snapshot = new OrderItemPricingSnapshot();
        snapshot.setCurrentPrice(orderItem.getCurrentPrice() != null ? orderItem.getCurrentPrice() : BigDecimal.ZERO);
        snapshot.setFinalPrice(orderItem.getFinalPrice() != null ? orderItem.getFinalPrice() : orderItem.getUnitPrice());
        snapshot.setHasActivePromotion(orderItem.getHasPromotion() != null ? orderItem.getHasPromotion() : false);
        snapshot.setQuantity(orderItem.getQuantity() != null ? orderItem.getQuantity() : 0);
        snapshot.setTotalBeforeDiscount(calculateTotalBeforeDiscount(orderItem));
        snapshot.setDiscountAmount(calculateDiscountAmount(orderItem));
        snapshot.setTotalPrice(orderItem.getTotalPrice() != null ? orderItem.getTotalPrice() : BigDecimal.ZERO);
        snapshot.setPromotionType(orderItem.getPromotionType());
        snapshot.setPromotionValue(orderItem.getPromotionValue());
        snapshot.setPromotionFromDate(orderItem.getPromotionFromDate());
        snapshot.setPromotionToDate(orderItem.getPromotionToDate());
        return snapshot;
    }

    default BigDecimal calculateTotalBeforeDiscount(OrderItem orderItem) {
        if (orderItem.getCurrentPrice() == null || orderItem.getQuantity() == null) {
            return BigDecimal.ZERO;
        }
        return orderItem.getCurrentPrice().multiply(new BigDecimal(orderItem.getQuantity()));
    }

    default BigDecimal calculateDiscountAmount(OrderItem orderItem) {
        BigDecimal totalBeforeDiscount = calculateTotalBeforeDiscount(orderItem);
        BigDecimal totalAfterDiscount = orderItem.getTotalPrice() != null ? orderItem.getTotalPrice() : BigDecimal.ZERO;
        return totalBeforeDiscount.subtract(totalAfterDiscount);
    }
}