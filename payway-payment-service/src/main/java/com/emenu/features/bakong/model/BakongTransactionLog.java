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
import java.util.UUID;

@Entity
@Table(name = "bakong_transaction_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class BakongTransactionLog extends BaseUUIDEntity {

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "transaction_ref_id")
    private UUID transactionRefId;

    @Column(name = "project_code", length = 100)
    private String projectCode;

    @Column(name = "api_key", length = 255)
    private String apiKey;

    @Column(name = "md5", length = 100)
    private String md5;

    @Column(name = "hash", length = 255)
    private String hash;

    @Column(name = "action", nullable = false, length = 50)
    private String action;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", length = 10)
    private String currency;

    @Column(name = "from_account_id", length = 100)
    private String fromAccountId;

    @Column(name = "to_account_id", length = 100)
    private String toAccountId;

    @Column(name = "merchant_name", length = 150)
    private String merchantName;

    @Column(name = "raw_qr_string", columnDefinition = "TEXT")
    private String rawQrString;

    @Column(name = "response_json", columnDefinition = "TEXT")
    private String responseJson;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}
