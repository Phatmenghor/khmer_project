package com.emenu.features.bakong.service;

import com.emenu.features.bakong.dto.BakongRequest;
import com.emenu.features.bakong.dto.BakongResponse;
import com.emenu.features.bakong.dto.CheckTransactionRequest;
import com.emenu.features.bakong.dto.TransactionStatusResponse;
import com.emenu.shared.dto.ApiResponse;
import kh.gov.nbc.bakong_khqr.model.KHQRData;
import kh.gov.nbc.bakong_khqr.model.KHQRResponse;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface BakongService {

    Mono<KHQRResponse<KHQRData>> generateQR(BakongRequest bakongRequest, String requestUrl);

    Mono<byte[]> getQRImage(KHQRData qr, String requestUrl);

    Mono<BakongResponse> checkTransactionByMD5(CheckTransactionRequest request, String requestUrl);

    Mono<TransactionStatusResponse> checkTransactionStatus(CheckTransactionRequest request, String requestUrl);

    Flux<ApiResponse<TransactionStatusResponse>> streamCheckTransaction(String md5, Integer intervalSeconds, String requestUrl);
}
