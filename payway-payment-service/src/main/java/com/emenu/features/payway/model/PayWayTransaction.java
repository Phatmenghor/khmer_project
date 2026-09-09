package com.emenu.features.payway.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payway_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayWayTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tran_id", nullable = false, unique = true, length = 100)
    private String tranId;

    @Column(name = "merchant_id", nullable = false, length = 50)
    private String merchantId;

    @Column(name = "req_time", length = 30)
    private String reqTime;

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", length = 10)
    private String currency;

    @Column(name = "payment_option", length = 50)
    private String paymentOption;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "apv", length = 100)
    private String apv;

    @Column(name = "payer_name", length = 100)
    private String payerName;

    @Column(name = "payer_email", length = 100)
    private String payerEmail;

    @Column(name = "payer_phone", length = 50)
    private String payerPhone;

    @Column(name = "hash", length = 255)
    private String hash;

    @Column(name = "order_id", length = 100)
    private String orderId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
