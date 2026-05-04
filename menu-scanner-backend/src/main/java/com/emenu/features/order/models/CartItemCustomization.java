package com.emenu.features.order.models;

import com.emenu.features.main.models.ProductCustomization;
import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "cart_item_customizations", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"cart_item_id", "product_customization_id"})
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class CartItemCustomization extends BaseUUIDEntity {

    @Column(name = "cart_item_id", nullable = false)
    private UUID cartItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_item_id", insertable = false, updatable = false)
    private CartItem cartItem;

    @Column(name = "product_customization_id", nullable = false)
    private UUID productCustomizationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_customization_id", insertable = false, updatable = false)
    private ProductCustomization productCustomization;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "price_adjustment", precision = 10, scale = 2)
    private BigDecimal priceAdjustment;

    public BigDecimal getPriceAdjustmentOrZero() {
        return priceAdjustment != null ? priceAdjustment : BigDecimal.ZERO;
    }

    public CartItemCustomization(UUID cartItemId, UUID productCustomizationId, String name, BigDecimal priceAdjustment) {
        this.cartItemId = cartItemId;
        this.productCustomizationId = productCustomizationId;
        this.name = name;
        this.priceAdjustment = priceAdjustment;
    }
}
