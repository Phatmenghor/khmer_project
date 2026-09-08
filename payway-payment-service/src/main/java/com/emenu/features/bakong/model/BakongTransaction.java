package com.emenu.features.bakong.model;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "bakong_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class BakongTransaction extends BaseUUIDEntity {

    @Column(name = "md5", nullable = false, unique = true, length = 100)
    private String md5;

    @Column(name = "hash", length = 255)
    private String hash;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "from_account_id", length = 100)
    private String fromAccountId;

    @Column(name = "to_account_id", length = 100)
    private String toAccountId;

    @Column(name = "order_id", length = 100)
    private String orderId;

    @Column(name = "subscription_id", length = 100)
    private String subscriptionId;

    @Column(name = "raw_qr_string", columnDefinition = "TEXT")
    private String rawQrString;
}
