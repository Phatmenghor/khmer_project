package com.emenu.features.bakong.service;

import com.emenu.features.bakong.dto.BakongIdRequest;
import com.emenu.features.bakong.dto.BakongTransactionDetailResponse;
import com.emenu.features.bakong.dto.BakongTransactionResponse;
import com.emenu.features.bakong.dto.BakongTransactionSearchRequest;
import com.emenu.features.bakong.dto.BakongVerifyRequest;
import com.emenu.features.bakong.dto.BakongVerifyResponse;
import com.emenu.shared.dto.PageResponse;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface BakongTransactionService {

    PageResponse<BakongTransactionResponse> searchTransactions(BakongTransactionSearchRequest request);

    BakongTransactionDetailResponse getTransactionDetail(BakongIdRequest request);

    BakongTransactionDetailResponse getTransactionDetail(UUID id);

    Mono<BakongVerifyResponse> verifyTransaction(BakongVerifyRequest request, String requestUrl);
}
