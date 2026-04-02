package com.emenu.features.auth.models;

import com.emenu.features.auth.enums.StockStatus;
import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "business_settings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class BusinessSetting extends BaseUUIDEntity {

    @Column(name = "business_id", nullable = false, unique = true)
    private UUID businessId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", insertable = false, updatable = false)
    private Business business;

    @Column(name = "tax_percentage")
    private Double taxPercentage;

    @Column(name = "logo_business_url")
    private String logoBusinessUrl;

    @Column(name = "enable_stock")
    @Enumerated(EnumType.STRING)
    private StockStatus enableStock;

    @OneToMany(
        mappedBy = "businessSetting",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private List<SocialMedia> socialMedia;
}
