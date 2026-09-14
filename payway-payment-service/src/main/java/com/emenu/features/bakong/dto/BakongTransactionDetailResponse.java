package com.emenu.features.bakong.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BakongTransactionDetailResponse {
    private BakongTransactionResponse transaction;
    private List<BakongTransactionLogResponse> logs;
}
