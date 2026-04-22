package com.emenu.features.main.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "product_customizations")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ProductCustomization extends BaseUUIDEntity {

    @Column(name = "product_customization_group_id", nullable = false)
    private UUID productCustomizationGroupId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_customization_group_id", insertable = false, updatable = false)
    private ProductCustomizationGroup customizationGroup;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price_adjustment", precision = 10, scale = 2)
    private BigDecimal priceAdjustment;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "status", nullable = false)
    private String status = "ACTIVE";

    public BigDecimal getPriceAdjustmentOrZero() {
        return priceAdjustment != null ? priceAdjustment : BigDecimal.ZERO;
    }
}
