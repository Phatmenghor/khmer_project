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
import org.springframework.data.domain.Page;

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

    List<OrderResponse> toResponseList(List<Order> orders);

    default PaginationResponse<OrderResponse> toPaginationResponse(Page<Order> orderPage, PaginationMapper paginationMapper) {
        return paginationMapper.toPaginationResponse(orderPage, this::toResponseList);
    }

    /**
     * Create order from helper DTO - pure MapStruct mapping
     */
    Order createFromHelper(OrderCreateHelper helper);

    /**
     * Create order item from helper DTO - pure MapStruct mapping
     */
    OrderItem createOrderItemFromHelper(OrderItemCreateHelper helper);

    /**
     * Helper to build OrderCreateHelper for checkout order
     */
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

    /**
     * Helper to build OrderItemCreateHelper from cart item
     */
    default OrderItemCreateHelper buildOrderItemHelperFromCartItem(CartItem cartItem, UUID orderId) {
        // Get promotion details from product or productSize
        String promotionType = null;
        BigDecimal promotionValue = null;
        LocalDateTime promotionFromDate = null;
        LocalDateTime promotionToDate = null;

        if (cartItem.getProduct() != null && cartItem.getProduct().getHasActivePromotion()) {
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
                .productImageUrl(cartItem.getProduct().getMainImageUrl())
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

    /**
     * Map delivery address from OrderDeliveryAddress snapshot entity to DTO
     */
    default com.emenu.features.order.dto.response.OrderDeliveryAddressDto mapDeliveryAddress(Order order) {
        if (order == null || order.getDeliveryAddress() == null) {
            return null;
        }

        var deliveryAddress = order.getDeliveryAddress();

        // Check if any delivery address field is populated
        if (deliveryAddress.getVillage() == null && deliveryAddress.getCommune() == null &&
            deliveryAddress.getDistrict() == null && deliveryAddress.getProvince() == null &&
            deliveryAddress.getStreetNumber() == null && deliveryAddress.getHouseNumber() == null &&
            deliveryAddress.getNote() == null && deliveryAddress.getLatitude() == null &&
            deliveryAddress.getLongitude() == null) {
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

    /**
     * Map delivery option from OrderDeliveryOption snapshot entity to DTO
     */
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


    /**
     * Calculate total number of items in the order
     */
    default Integer calculateTotalItems(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return 0;
        }
        return order.getItems().stream()
                .mapToInt(OrderItem::getQuantity)
                .sum();
    }

    /**
     * Map order status history to response DTOs
     * Returns empty list if no history exists (order just created)
     */
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
                        .statusDescription(history.getOrderStatus() != null ?
                                history.getOrderStatus().getDescription() : null)
                        .note(history.getNote())
                        .changedBy(mapStatusHistoryUserInfo(history))
                        .changedAt(history.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Map user details from status history
     */
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

    /**
     * Map pricing details to nested pricing info object with before/after snapshots
     */
    default OrderPricingInfo mapPricingInfo(Order order) {
        if (order == null) {
            return null;
        }

        BigDecimal subtotalBeforeDiscount = calculateSubtotalBeforeDiscount(order);
        BigDecimal discount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal subtotalAfterDiscount = subtotalBeforeDiscount.subtract(discount);
        BigDecimal deliveryFee = order.getDeliveryFee() != null ? order.getDeliveryFee() : BigDecimal.ZERO;
        BigDecimal taxAmount = order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO;

        // Build before snapshot (before order-level changes)
        OrderPricingSnapshot before = OrderPricingSnapshot.builder()
                .totalItems(calculateTotalItems(order))
                .subtotalBeforeDiscount(subtotalBeforeDiscount)
                .subtotal(subtotalBeforeDiscount)  // Before discount
                .totalDiscount(BigDecimal.ZERO)
                .deliveryFee(deliveryFee)
                .taxAmount(taxAmount)
                .finalTotal(subtotalBeforeDiscount.add(deliveryFee).add(taxAmount))
                .build();

        // Build after snapshot (after order-level changes if any)
        OrderPricingSnapshot after = OrderPricingSnapshot.builder()
                .totalItems(calculateTotalItems(order))
                .subtotalBeforeDiscount(subtotalBeforeDiscount)
                .subtotal(subtotalAfterDiscount)  // After discount
                .totalDiscount(discount)
                .deliveryFee(deliveryFee)
                .taxAmount(taxAmount)
                .finalTotal(order.getTotalAmount() != null ? order.getTotalAmount() :
                           subtotalAfterDiscount.add(deliveryFee).add(taxAmount))
                .build();

        boolean hadChange = order.getHadOrderLevelChangeFromPOS() != null && order.getHadOrderLevelChangeFromPOS();

        return OrderPricingInfo.builder()
                .before(before)
                .hadOrderLevelChangeFromPOS(hadChange)
                .after(hadChange ? after : null)  // Only include after if there were changes
                .reason(order.getOrderLevelChangeReason() != null ? order.getOrderLevelChangeReason() : "No order-level changes")
                .build();
    }

    /**
     * Calculate subtotal before any discounts by summing items at original price (currentPrice * quantity)
     */
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

    /**
     * Map payment method and status to nested payment info object
     */
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
