package com.emenu.features.bakong.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
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
public class BakongTransactionLogResponse {

    private UUID id;
    private UUID transactionId;
    private String projectCode;
    private String apiKey;
    private String md5;
    private String hash;
    private String action;
    private String status;
    private BigDecimal amount;
    private String currency;
    private String fromAccountId;
    private String toAccountId;
    private String merchantName;
    private String errorMessage;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
}
