package com.emenu.features.order.models;

import com.emenu.features.auth.models.Business;
import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "business_exchange_rates")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class BusinessExchangeRate extends BaseUUIDEntity {

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", insertable = false, updatable = false)
    private Business business;

    // Required: USD to KHR exchange rate
    @Column(name = "usd_to_khr_rate", nullable = false)
    private Double usdToKhrRate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ExchangeRateStatus status = ExchangeRateStatus.ACTIVE;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // ================================
    // BUSINESS METHODS
    // ================================

    public boolean isActive() {
        return status == ExchangeRateStatus.ACTIVE;
    }

    public void activate() {
        this.status = ExchangeRateStatus.ACTIVE;
    }

    public void deactivate() {
        this.status = ExchangeRateStatus.INACTIVE;
    }


    public enum ExchangeRateStatus {
        ACTIVE, INACTIVE
    }
}



