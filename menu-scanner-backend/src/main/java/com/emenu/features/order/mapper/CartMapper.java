package com.emenu.features.order.mapper;

import com.emenu.features.order.dto.helper.CartCreateHelper;
import com.emenu.features.order.dto.response.CartItemCustomizationResponse;
import com.emenu.features.order.dto.response.CartItemResponse;
import com.emenu.features.order.dto.response.CartResponse;
import com.emenu.features.order.dto.response.CartSummaryResponse;
import com.emenu.features.order.models.Cart;
import com.emenu.features.order.models.CartItem;
import com.emenu.features.order.models.CartItemCustomization;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring", uses = {PaginationMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CartMapper {

    @Mapping(target = "productId", source = "productId")
    @Mapping(target = "productSizeId", source = "productSizeId")
    @Mapping(target = "sizeName", source = "sizeName")
    @Mapping(target = "currentPrice", expression = "java(cartItem.getCurrentPrice())")
    @Mapping(target = "finalPrice", expression = "java(cartItem.getFinalPrice())")
    @Mapping(target = "totalPrice", expression = "java(cartItem.getTotalPrice())")
    @Mapping(target = "hasActivePromotion", expression = "java(cartItem.hasDiscount())")
    CartItemResponse toItemResponse(CartItem cartItem);

    @AfterMapping
    default void setProductInfo(@MappingTarget CartItemResponse response, CartItem cartItem) {
        // Flatten product info to response
        response.setProductId(cartItem.getProductId());
        response.setProductSizeId(cartItem.getProductSizeId());
        response.setSizeName(cartItem.getSizeName());
        if (cartItem.getProduct() != null) {
            response.setProductName(cartItem.getProduct().getName());
            response.setProductImageUrl(cartItem.getProduct().getMainImageUrl());
            response.setStatus(cartItem.getProduct().getStatus() != null
                    ? cartItem.getProduct().getStatus().name() : null);
            // Set SKU and barcode from product master data
            response.setSku(cartItem.getProduct().getSku());
            response.setBarcode(cartItem.getProduct().getBarcode());
        }
    }


    @AfterMapping
    default void setCustomizations(@MappingTarget CartItemResponse response, CartItem cartItem) {
        if (cartItem.getCustomizations() != null && !cartItem.getCustomizations().isEmpty()) {
            response.setCustomizations(
                    cartItem.getCustomizations().stream()
                            .map(custom -> new CartItemCustomizationResponse(
                                    custom.getId(),
                                    custom.getProductCustomizationId(),
                                    custom.getName(),
                                    custom.getPriceAdjustment()
                            ))
                            .toList()
            );
        }
    }

    List<CartItemResponse> toItemResponseList(List<CartItem> cartItems);
    List<CartResponse> toResponseList(List<Cart> carts);

    @Mapping(source = "business.name", target = "businessName")
    @Mapping(target = "totalItems", expression = "java(cart.getTotalItems())")
    @Mapping(target = "subtotalBeforeDiscount", expression = "java(calculateSubtotalBeforeDiscount(cart))")
    @Mapping(target = "subtotal", expression = "java(cart.getSubtotal())")
    @Mapping(target = "totalDiscount", expression = "java(cart.getTotalDiscount())")
    @Mapping(target = "finalTotal", expression = "java(cart.getSubtotal())")
    @Mapping(target = "unavailableItems", expression = "java(cart.getUnavailableItemsCount())")
    CartResponse toResponse(Cart cart);

    @AfterMapping
    default void setCartItems(@MappingTarget CartResponse response, Cart cart) {
        if (cart.getItems() != null) {
            response.setItems(toItemResponseList(cart.getItems()));
        }
    }

    default PaginationResponse<CartResponse> toPaginationResponse(Page<Cart> cartPage, PaginationMapper paginationMapper) {
return paginationMapper.toPaginationResponse(cartPage, this::toResponseList);
    }

    @Mapping(source = "business.name", target = "businessName")
    @Mapping(target = "totalItems", expression = "java(cart.getTotalItems())")
    @Mapping(target = "subtotalBeforeDiscount", expression = "java(calculateSubtotalBeforeDiscount(cart))")
    @Mapping(target = "subtotal", expression = "java(cart.getSubtotal())")
    @Mapping(target = "totalDiscount", expression = "java(cart.getTotalDiscount())")
    @Mapping(target = "finalTotal", expression = "java(cart.getSubtotal())")
    CartSummaryResponse toSummaryResponse(Cart cart);

    @AfterMapping
    default void setSummaryCartItems(@MappingTarget CartSummaryResponse response, Cart cart) {
        if (cart.getItems() != null) {
            response.setItems(toItemResponseList(cart.getItems()));
            // Calculate total quantity (sum of all item quantities)
            int totalQuantity = cart.getItems().stream()
                    .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                    .sum();
            response.setTotalQuantity(totalQuantity);
        }
    }

    /**
     * Calculate cart subtotal before any discounts by summing items at original price (currentPrice * quantity)
     */
    default BigDecimal calculateSubtotalBeforeDiscount(Cart cart) {
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            return BigDecimal.ZERO;
        }

        return cart.getItems().stream()
                .map(item -> {
                    if (item.getCurrentPrice() != null && item.getQuantity() != null) {
                        return item.getCurrentPrice().multiply(new BigDecimal(item.getQuantity()));
                    }
                    return BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Create a new cart from helper DTO - pure MapStruct mapping
     */
    @Mapping(source = "userId", target = "userId")
    @Mapping(source = "businessId", target = "businessId")
    Cart createFromHelper(CartCreateHelper helper);
}
