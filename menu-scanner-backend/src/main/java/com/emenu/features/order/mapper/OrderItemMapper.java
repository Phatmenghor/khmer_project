package com.emenu.features.order.mapper;

import com.emenu.features.order.dto.response.OrderItemPricingSnapshot;
import com.emenu.features.order.dto.response.OrderItemResponse;
import com.emenu.features.order.models.OrderItem;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderItemMapper {

    @Mapping(target = "product", expression = "java(mapProductInfo(orderItem))")
    @Mapping(target = "before", expression = "java(deserializeBeforeSnapshot(orderItem))")
    @Mapping(target = "hadChangeFromPOS", expression = "java(orderItem.getHadChangeFromPOS() != null ? orderItem.getHadChangeFromPOS() : false)")
    @Mapping(target = "after", expression = "java(orderItem.getHadChangeFromPOS() != null && orderItem.getHadChangeFromPOS() ? deserializeAfterSnapshot(orderItem) : null)")
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

    default OrderItemPricingSnapshot deserializeBeforeSnapshot(OrderItem orderItem) {
        // Use proper fields instead of JSON deserialization
        if (orderItem.getBeforeCurrentPrice() != null) {
            return OrderItemPricingSnapshot.builder()
                    .currentPrice(orderItem.getBeforeCurrentPrice())
                    .finalPrice(orderItem.getBeforeFinalPrice())
                    .hasActivePromotion(orderItem.getBeforeHasActivePromotion())
                    .quantity(orderItem.getQuantity())
                    .totalBeforeDiscount(calculateTotalBeforeDiscount(orderItem.getBeforeCurrentPrice(), orderItem.getQuantity()))
                    .discountAmount(orderItem.getBeforeDiscountAmount())
                    .totalPrice(orderItem.getBeforeTotalPrice())
                    .promotionType(orderItem.getBeforePromotionType())
                    .promotionValue(orderItem.getBeforePromotionValue())
                    .promotionFromDate(orderItem.getBeforePromotionFromDate())
                    .promotionToDate(orderItem.getBeforePromotionToDate())
                    .build();
        }
        // Fall back to building from current pricing if no before data
        return buildDefaultBeforeSnapshot(orderItem);
    }

    default OrderItemPricingSnapshot deserializeAfterSnapshot(OrderItem orderItem) {
        // Use proper fields instead of JSON deserialization
        if (orderItem.getAfterCurrentPrice() != null) {
            return OrderItemPricingSnapshot.builder()
                    .currentPrice(orderItem.getAfterCurrentPrice())
                    .finalPrice(orderItem.getAfterFinalPrice())
                    .hasActivePromotion(orderItem.getAfterHasActivePromotion())
                    .quantity(orderItem.getQuantity())
                    .totalBeforeDiscount(calculateTotalBeforeDiscount(orderItem.getAfterCurrentPrice(), orderItem.getQuantity()))
                    .discountAmount(orderItem.getAfterDiscountAmount())
                    .totalPrice(orderItem.getAfterTotalPrice())
                    .promotionType(orderItem.getAfterPromotionType())
                    .promotionValue(orderItem.getAfterPromotionValue())
                    .promotionFromDate(orderItem.getAfterPromotionFromDate())
                    .promotionToDate(orderItem.getAfterPromotionToDate())
                    .build();
        }
        // Fall back to building from current pricing if no after data
        return buildDefaultAfterSnapshot(orderItem);
    }

    default BigDecimal calculateTotalBeforeDiscount(BigDecimal price, Integer quantity) {
        if (price == null || quantity == null) {
            return BigDecimal.ZERO;
        }
        return price.multiply(new BigDecimal(quantity));
    }

    default OrderItemPricingSnapshot buildDefaultBeforeSnapshot(OrderItem orderItem) {
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

    default OrderItemPricingSnapshot buildDefaultAfterSnapshot(OrderItem orderItem) {
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