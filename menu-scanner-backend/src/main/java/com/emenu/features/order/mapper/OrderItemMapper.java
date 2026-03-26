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
    @Mapping(target = "after", expression = "java(deserializeAfterSnapshot(orderItem))")
    @Mapping(target = "auditMetadata", expression = "java(deserializeAuditMetadata(orderItem))")
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
        // Try to deserialize from stored JSON snapshot first
        if (orderItem.getBeforeSnapshot() != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                return mapper.readValue(orderItem.getBeforeSnapshot(), OrderItemPricingSnapshot.class);
            } catch (Exception e) {
                // Fall back to building from current data
            }
        }
        // Build before snapshot from current pricing if no stored snapshot
        return buildDefaultBeforeSnapshot(orderItem);
    }

    default OrderItemPricingSnapshot deserializeAfterSnapshot(OrderItem orderItem) {
        // Try to deserialize from stored JSON snapshot first
        if (orderItem.getAfterSnapshot() != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                return mapper.readValue(orderItem.getAfterSnapshot(), OrderItemPricingSnapshot.class);
            } catch (Exception e) {
                // Fall back to building from current data
            }
        }
        // Build after snapshot from current pricing if no stored snapshot
        return buildDefaultAfterSnapshot(orderItem);
    }

    default Map<String, Object> deserializeAuditMetadata(OrderItem orderItem) {
        if (orderItem.getAuditMetadata() == null) {
            return null;
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(orderItem.getAuditMetadata(), Map.class);
        } catch (Exception e) {
            return null;
        }
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