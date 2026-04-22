package com.emenu.features.main.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "product_customization_groups")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ProductCustomizationGroup extends BaseUUIDEntity {

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = false;

    @Column(name = "allow_multiple", nullable = false)
    private Boolean allowMultiple = true;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "status", nullable = false)
    private String status = "ACTIVE";

    @OneToMany(mappedBy = "customizationGroup", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<ProductCustomization> customizations = new ArrayList<>();
}
