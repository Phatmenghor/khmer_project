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
@Table(name = "business_exchange_rates", indexes = {
        @Index(name = "idx_business_exchange_rate_business", columnList = "business_id, is_deleted"),
        @Index(name = "idx_business_exchange_rate_status", columnList = "business_id, status, is_deleted")
})
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

    // Optional: USD to Chinese Yuan (CNY)
    @Column(name = "usd_to_cny_rate")
    private Double usdToCnyRate;

    // Optional: USD to Vietnamese Dong (VND)
    @Column(name = "usd_to_vnd_rate")
    private Double usdToVndRate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ExchangeRateStatus status = ExchangeRateStatus.ACTIVE;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // ================================
    // BUSINESS METHODS
    // ================================

    /**
     * Check if this rate is currently active
     */
    public boolean isActive() {
        return status == ExchangeRateStatus.ACTIVE;
    }

    /**
     * Activate this exchange rate
     */
    public void activate() {
        this.status = ExchangeRateStatus.ACTIVE;
    }

    /**
     * Deactivate this exchange rate
     */
    public void deactivate() {
        this.status = ExchangeRateStatus.INACTIVE;
    }


    /**
     * Enum for exchange rate status
     */
    public enum ExchangeRateStatus {
        ACTIVE, INACTIVE
    }
}


