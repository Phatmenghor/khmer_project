package com.emenu.features.bakong.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BakongTransactionDto {

    private UUID id;
    private String transactionId;
    private String projectCode;
    private String apiKey;
    private String md5;
    private String hash;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String fromAccountId;
    private String toAccountId;
    private String merchantName;
    private String rawQrString;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
