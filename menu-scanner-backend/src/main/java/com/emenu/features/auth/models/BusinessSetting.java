package com.emenu.features.auth.models;

import com.emenu.enums.common.StockStatus;
import com.emenu.shared.domain.BaseUUIDEntity;
import com.emenu.shared.dto.ImageUrls;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "logo_business", columnDefinition = "jsonb")
    private ImageUrls logoBusiness;

    @Column(name = "enable_stock")
    @Enumerated(EnumType.STRING)
    private StockStatus enableStock;

    @Column(name = "primary_color")
    private String primaryColor;

    @OneToMany(
        mappedBy = "businessSetting",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private List<SocialMedia> socialMedia;

    @OneToMany(
        mappedBy = "businessSetting",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private List<BusinessHours> businessHours;

    @Column(name = "use_brands", nullable = false)
    private Boolean useBrands = true;

    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold;

    @Column(name = "telegram_group_chat_id", length = 50)
    private String telegramGroupChatId;
}
