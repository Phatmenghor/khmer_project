package com.emenu.features.order.mapper;

import com.emenu.features.location.mapper.LocationMapper;
import com.emenu.features.order.dto.helper.OrderCreateHelper;
import com.emenu.features.order.dto.helper.OrderItemCreateHelper;
import com.emenu.features.order.dto.request.OrderCreateRequest;
import com.emenu.features.order.dto.response.*;
import com.emenu.features.order.models.CartItem;
import com.emenu.features.order.models.Order;
import com.emenu.features.order.models.OrderItem;
import com.emenu.features.order.models.OrderStatusHistory;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.BeanMapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.data.domain.Page;
import com.emenu.shared.dto.ImageUrls;
import com.emenu.features.order.dto.request.POSCheckoutRequest;
import com.emenu.features.order.dto.request.DeliveryAddressRequest;
import com.emenu.features.order.dto.request.DeliveryOptionRequest;
import com.emenu.features.order.models.OrderDeliveryAddress;
import com.emenu.features.order.models.OrderDeliveryOption;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {LocationMapper.class, DeliveryOptionMapper.class, OrderItemMapper.class, PaginationMapper.class, OrderStatusHistoryMapper.class})
public interface OrderMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "updatedAt", source = "updatedAt")
    @Mapping(target = "createdBy", source = "createdBy")
    @Mapping(target = "updatedBy", source = "updatedBy")
    @Mapping(source = "customerName", target = "customerName")
    @Mapping(source = "customerPhone", target = "customerPhone")
    @Mapping(source = "customerEmail", target = "customerEmail")
    @Mapping(source = "business.name", target = "businessName")
    @Mapping(target = "deliveryAddress", expression = "java(mapDeliveryAddress(order))")
    @Mapping(target = "deliveryOption", expression = "java(mapDeliveryOption(order))")
    @Mapping(source = "orderStatus", target = "orderStatus")
    @Mapping(target = "pricing", expression = "java(mapPricingInfo(order))")
    @Mapping(target = "statusHistory", expression = "java(mapStatusHistory(order))")
    @Mapping(target = "payment", expression = "java(mapPaymentInfo(order))")
    OrderResponse toResponse(Order order);

    default List<OrderResponse> toResponseList(List<Order> orders) {
        if (orders == null) {
            return null;
        }
        List<OrderResponse> list = new java.util.ArrayList<>(orders.size());
        for (Order order : orders) {
            OrderResponse response = toResponse(order);
            if (response != null) {
                response.setStatusHistory(null);
            }
            list.add(response);
        }
        return list;
    }

    Order createFromHelper(OrderCreateHelper helper);

    OrderItem createOrderItemFromHelper(OrderItemCreateHelper helper);

    default ImageUrls toImageUrls(String singleUrl) {
        if (singleUrl == null || singleUrl.isBlank()) {
            return null;
        }
        String sm = singleUrl;
        String md = singleUrl;
        String o = singleUrl;
        if (singleUrl.contains("-sm.")) {
            md = singleUrl.replace("-sm.", "-md.");
            o = singleUrl.replace("-sm.", "-o.");
        } else if (singleUrl.contains("-md.")) {
            sm = singleUrl.replace("-md.", "-sm.");
            o = singleUrl.replace("-md.", "-o.");
        } else if (singleUrl.contains("-o.")) {
            sm = singleUrl.replace("-o.", "-sm.");
            md = singleUrl.replace("-o.", "-md.");
        }
        return ImageUrls.builder()
                .sm(sm)
                .md(md)
                .o(o)
                .build();
    }

    OrderItem toOrderItem(com.emenu.features.order.dto.request.OrderItemUpdateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "orderNumber", ignore = true)
    @Mapping(target = "deliveryOption", ignore = true)
    @Mapping(target = "deliveryAddress", ignore = true)
    @Mapping(target = "orderStatus", expression = "java(com.emenu.enums.order.OrderStatus.COMPLETED)")
    @Mapping(target = "source", constant = "POS")
    @Mapping(target = "orderFrom", expression = "java(com.emenu.features.order.enums.OrderFromEnum.BUSINESS)")
    @Mapping(target = "paymentMethod", expression = "java(com.emenu.enums.payment.PaymentMethod.CASH)")
    @Mapping(target = "paymentStatus", expression = "java(com.emenu.enums.payment.PaymentStatus.PAID)")
    @Mapping(target = "subtotal", source = "pricing.subtotal")
    @Mapping(target = "deliveryFee", source = "pricing.deliveryFee")
    @Mapping(target = "taxPercentage", source = "pricing.taxPercentage")
    @Mapping(target = "taxAmount", source = "pricing.taxAmount")
    @Mapping(target = "discountAmount", source = "pricing.discountAmount")
    @Mapping(target = "discountType", source = "pricing.discountType")
    @Mapping(target = "discountReason", source = "pricing.discountReason")
    @Mapping(target = "totalAmount", source = "pricing.finalTotal")
    Order fromPOSCheckoutRequest(POSCheckoutRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "orderId", ignore = true)
    void updateDeliveryAddress(DeliveryAddressRequest request, @MappingTarget OrderDeliveryAddress target);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "orderId", ignore = true)
    void updateDeliveryOption(DeliveryOptionRequest request, @MappingTarget OrderDeliveryOption target);

    default OrderCreateHelper buildOrderHelper(OrderCreateRequest request, UUID customerId, String orderNumber) {
        var builder = OrderCreateHelper.builder()
                .orderNumber(orderNumber)
                .customerId(customerId)
                .businessId(request.getBusinessId())
                .paymentMethod(request.getPayment() != null ? request.getPayment().getPaymentMethod() : null)
                .paymentStatus(request.getPayment() != null ? request.getPayment().getPaymentStatus() : null)
                .customerNote(request.getCustomerNote())
                // Initialize pricing with defaults - will be updated after items are processed
                .subtotal(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                // Initialize businessNote as empty (will be set later if provided)
                .businessNote("");

        // Delivery address will be created from addressId in service layer
        // by fetching from database - not set here

        // Set delivery option fields (no JSON serialization)
        if (request.getDeliveryOption() != null) {
            builder.deliveryOptionName(request.getDeliveryOption().getName());
            builder.deliveryOptionDescription(request.getDeliveryOption().getDescription());
            builder.deliveryOptionImageUrl(request.getDeliveryOption().getImageUrl());
            builder.deliveryOptionPrice(request.getDeliveryOption().getPrice());
            builder.deliveryFee(request.getDeliveryOption().getPrice());
        }

        return builder.build();
    }

    default OrderItemCreateHelper buildOrderItemHelperFromCartItem(CartItem cartItem, UUID orderId) {
        // Get promotion details from product or productSize
        String promotionType = null;
        BigDecimal promotionValue = null;
        LocalDateTime promotionFromDate = null;
        LocalDateTime promotionToDate = null;

        if (cartItem.getProduct() != null && cartItem.getProduct().isPromotionActive()) {
            promotionType = cartItem.getProduct().getPromotionType() != null ?
                    cartItem.getProduct().getPromotionType().toString() : null;
            promotionValue = cartItem.getProduct().getPromotionValue();
            promotionFromDate = cartItem.getProduct().getPromotionFromDate();
            promotionToDate = cartItem.getProduct().getPromotionToDate();
        }

        return OrderItemCreateHelper.builder()
                .orderId(orderId)
                .productId(cartItem.getProductId())
                .productSizeId(cartItem.getProductSizeId())
                .productName(cartItem.getProduct().getName())
                .productImageUrl(cartItem.getProduct().getMainImage())
                .sizeName(cartItem.getSizeName())
                // Pricing snapshot
                .currentPrice(cartItem.getCurrentPrice())
                .finalPrice(cartItem.getFinalPrice())
                .unitPrice(cartItem.getFinalPrice())
                .hasPromotion(cartItem.hasDiscount())
                // Promotion details snapshot
                .promotionType(promotionType)
                .promotionValue(promotionValue)
                .promotionFromDate(promotionFromDate)
                .promotionToDate(promotionToDate)
                .quantity(cartItem.getQuantity())
                .build();
    }

    default com.emenu.features.order.dto.response.OrderDeliveryAddressDto mapDeliveryAddress(Order order) {
        if (order == null || order.getDeliveryAddress() == null) {
            return null;
        }

        var deliveryAddress = order.getDeliveryAddress();

        // Check if any delivery address field is populated (address fields or location reference)
        if (deliveryAddress.getVillage() == null && deliveryAddress.getCommune() == null &&
            deliveryAddress.getDistrict() == null && deliveryAddress.getProvince() == null &&
            deliveryAddress.getStreetNumber() == null && deliveryAddress.getHouseNumber() == null &&
            deliveryAddress.getNote() == null && deliveryAddress.getLatitude() == null &&
            deliveryAddress.getLongitude() == null && deliveryAddress.getLocationId() == null) {
            return null;
        }

        return com.emenu.features.order.dto.response.OrderDeliveryAddressDto.builder()
                .village(deliveryAddress.getVillage())
                .commune(deliveryAddress.getCommune())
                .district(deliveryAddress.getDistrict())
                .province(deliveryAddress.getProvince())
                .streetNumber(deliveryAddress.getStreetNumber())
                .houseNumber(deliveryAddress.getHouseNumber())
                .note(deliveryAddress.getNote())
                .latitude(deliveryAddress.getLatitude())
                .longitude(deliveryAddress.getLongitude())
                .locationId(deliveryAddress.getLocationId())
                .locationImages(deliveryAddress.getLocationImages())
                .build();
    }

    default com.emenu.features.order.dto.response.OrderDeliveryOptionDto mapDeliveryOption(Order order) {
        if (order == null || order.getDeliveryOption() == null) {
            return null;
        }

        var deliveryOption = order.getDeliveryOption();

        // Check if any delivery option field is populated
        if (deliveryOption.getName() == null && deliveryOption.getDescription() == null &&
            deliveryOption.getImageUrl() == null && deliveryOption.getPrice() == null) {
            return null;
        }

        return com.emenu.features.order.dto.response.OrderDeliveryOptionDto.builder()
                .name(deliveryOption.getName())
                .description(deliveryOption.getDescription())
                .imageUrl(deliveryOption.getImageUrl())
                .price(deliveryOption.getPrice())
                .build();
    }


    default Integer calculateTotalItems(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return 0;
        }
        return order.getItems().stream()
                .mapToInt(OrderItem::getQuantity)
                .sum();
    }

    default List<OrderStatusHistoryResponse> mapStatusHistory(Order order) {
        if (order.getStatusHistory() == null || order.getStatusHistory().isEmpty()) {
            // Return empty list instead of null for consistency with client expectations
            return List.of();
        }

        return order.getStatusHistory().stream()
                .map(history -> OrderStatusHistoryResponse.builder()
                        .id(history.getId())
                        .statusName(history.getOrderStatus() != null ?
                                history.getOrderStatus().getDisplayName() : null)
                        .note(history.getNote())
                        .changedBy(mapStatusHistoryUserInfo(history))
                        .changedAt(history.getCreatedAt())
                        .paymentMethod(history.getPaymentMethod())
                        .paymentStatus(history.getPaymentStatus())
                        .build())
                .collect(Collectors.toList());
    }

    default OrderStatusHistoryUserInfo mapStatusHistoryUserInfo(OrderStatusHistory history) {
        if (history.getChangedByUser() == null) {
            return null;
        }

        com.emenu.features.auth.models.User u = history.getChangedByUser();
        com.emenu.features.auth.models.UserProfile p = u.getProfile();
        return OrderStatusHistoryUserInfo.builder()
                .userId(history.getChangedByUserId())
                .firstName(p != null ? p.getFirstName() : null)
                .lastName(p != null ? p.getLastName() : null)
                .phoneNumber(p != null ? p.getPhoneNumber() : null)
                .businessId(u.getBusinessId())
                .build();
    }

    default OrderPricingInfo mapPricingInfo(Order order) {
        if (order == null) {
            return null;
        }

        return OrderPricingInfo.builder()
                .totalItems(calculateTotalItems(order))
                .subtotal(order.getSubtotal() != null ? order.getSubtotal() : BigDecimal.ZERO)
                .customizationTotal(order.getCustomizationTotal() != null ? order.getCustomizationTotal() : BigDecimal.ZERO)
                .deliveryFee(order.getDeliveryFee() != null ? order.getDeliveryFee() : BigDecimal.ZERO)
                .taxPercentage(order.getTaxPercentage() != null ? order.getTaxPercentage() : BigDecimal.ZERO)
                .taxAmount(order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO)
                .discountAmount(order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO)
                .discountType(order.getDiscountType())
                .discountReason(order.getDiscountReason())
                .finalTotal(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO)
                .build();
    }

    default BigDecimal calculateItemLevelDiscounts(Order order) {
        if (order == null || order.getItems() == null || order.getItems().isEmpty()) {
            return BigDecimal.ZERO;
        }

        return order.getItems().stream()
                .map(item -> {
                    if (item.getCurrentPrice() != null && item.getFinalPrice() != null && item.getQuantity() != null) {
                        BigDecimal discountPerItem = item.getCurrentPrice().subtract(item.getFinalPrice());
                        return discountPerItem.multiply(new BigDecimal(item.getQuantity()));
                    }
                    return BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    default BigDecimal calculateSubtotalBeforeDiscount(Order order) {
        if (order == null || order.getItems() == null || order.getItems().isEmpty()) {
            return BigDecimal.ZERO;
        }

        return order.getItems().stream()
                .map(item -> {
                    if (item.getCurrentPrice() != null && item.getQuantity() != null) {
                        return item.getCurrentPrice().multiply(new BigDecimal(item.getQuantity()));
                    }
                    return BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    default OrderPaymentInfo mapPaymentInfo(Order order) {
        if (order == null) {
            return null;
        }

        return OrderPaymentInfo.builder()
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .build();
    }
}


