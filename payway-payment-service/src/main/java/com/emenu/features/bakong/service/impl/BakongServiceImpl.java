package com.emenu.features.bakong.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.emenu.config.exception.BakongPaymentException;
import com.emenu.config.exception.BakongUpstreamException;
import com.emenu.features.bakong.common.BakongReactiveExecutor;
import com.emenu.features.bakong.config.BakongProperties;
import com.emenu.features.bakong.dto.BakongQrResponse;
import com.emenu.features.bakong.dto.BakongRequest;
import com.emenu.features.bakong.dto.BakongResponse;
import com.emenu.features.bakong.dto.CheckAccountRequest;
import com.emenu.features.bakong.dto.CheckHashRequest;
import com.emenu.features.bakong.dto.CheckMd5ListRequest;
import com.emenu.features.bakong.dto.CheckTransactionRequest;
import com.emenu.features.bakong.dto.GenerateDeeplinkRequest;
import com.emenu.features.bakong.dto.TransactionStatusResponse;
import com.emenu.features.bakong.enums.TransactionState;
import com.emenu.features.bakong.common.TelegramNotifier;
import com.emenu.features.bakong.mapper.MerchantInfoMapper;
import com.emenu.features.bakong.mapper.TransactionStatusMapper;
import com.emenu.features.bakong.model.BakongTransaction;
import com.emenu.features.bakong.repository.BakongTransactionRepository;
import com.emenu.features.bakong.service.BakongService;
import com.emenu.features.bakong.service.BakongTokenService;
import com.emenu.features.bakong.common.QrImageUtils;
import com.emenu.shared.dto.ApiResponse;
import kh.gov.nbc.bakong_khqr.BakongKHQR;
import kh.gov.nbc.bakong_khqr.model.KHQRData;
import kh.gov.nbc.bakong_khqr.model.KHQRResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BakongServiceImpl implements BakongService {

    private final RestClient restClient;
    private final ObjectMapper mapper;
    private final BakongProperties bakongProperties;
    private final BakongTokenService bakongTokenService;
    private final MerchantInfoMapper merchantInfoMapper;
    private final TransactionStatusMapper transactionStatusMapper;
    private final TelegramNotifier telegramNotifier;
    private final BakongReactiveExecutor reactiveExecutor;
    private final BakongTransactionRepository bakongTransactionRepository;

    @Override
    public Mono<BakongQrResponse> generateQR(BakongRequest bakongRequest, String requestUrl) {
        return reactiveExecutor.executeReactive("generateQR", () -> {
            log.info("Generating Bakong KHQR for merchantName={}, amount={} {}",
                    bakongRequest.getMerchantName(),
                    bakongRequest.getAmount(),
                    bakongRequest.getCurrency());
            try {
                KHQRResponse<KHQRData> response = BakongKHQR.generateMerchant(
                        merchantInfoMapper.toMerchantInfo(bakongRequest, bakongProperties.getAccountId())
                );

                if (response.getKHQRStatus() != null && response.getKHQRStatus().getCode() != 0) {
                    String statusMsg = response.getKHQRStatus().getMessage();
                    log.error("Bakong KHQR generation error: code={}, message={}",
                            response.getKHQRStatus().getCode(), statusMsg);
                    throw new BakongPaymentException("Bakong KHQR Generation Error: " + statusMsg);
                }

                KHQRData qrData = response.getData();
                String qr = qrData == null ? null : qrData.getQr();
                String md5 = qrData == null ? null : qrData.getMd5();
                log.info("KHQR generated successfully, md5={}", md5);

                if (qrData != null && md5 != null) {
                    saveTransactionRecord(bakongRequest, qrData);
                }

                telegramNotifier.notifyQrGenerated(requestUrl, bakongRequest, response);

                return BakongQrResponse.builder()
                        .qr(qr)
                        .md5(md5)
                        .build();
            } catch (Exception ex) {
                log.error("Failed to generate Bakong KHQR for merchantName={}: {}",
                        bakongRequest.getMerchantName(), ex.getMessage());
                telegramNotifier.notifyIssue("QR generation failed", requestUrl, bakongRequest, ex);
                throw new BakongPaymentException("Failed to generate Bakong KHQR: " + ex.getMessage(), ex);
            }
        });
    }

    @Override
    public Mono<byte[]> getQRImage(CheckTransactionRequest request, String requestUrl) {
        return reactiveExecutor.executeReactive("getQRImage", () -> {
            BakongTransaction tx = bakongTransactionRepository.findByMd5(request.getMd5())
                    .orElseThrow(() -> new BakongPaymentException("Bakong Transaction not found for MD5: " + request.getMd5()));

            if (tx.getRawQrString() == null || tx.getRawQrString().isBlank()) {
                throw new BakongPaymentException("Stored QR payload is empty for MD5: " + request.getMd5());
            }

            Double amt = tx.getAmount() != null ? tx.getAmount().doubleValue() : null;
            return QrImageUtils.generateKhqrMerchantCard(
                    tx.getRawQrString(),
                    tx.getMerchantName(),
                    amt,
                    tx.getCurrency()
            );
        });
    }

    @Override
    public Mono<BakongResponse> generateDeeplink(GenerateDeeplinkRequest request, String requestUrl) {
        return reactiveExecutor.executeReactive("generateDeeplink", () -> {
            String url = bakongProperties.getApiUrl() + "/v1/generate_deeplink_by_qr";
            log.info("Generating Bakong deeplink against upstreamUrl={}", url);

            Map<String, Object> payload = new HashMap<>();
            payload.put("qr", request.getQr());

            if (request.getAppName() != null || request.getAppIconUrl() != null || request.getAppDeepLinkCallback() != null) {
                Map<String, String> sourceInfo = new HashMap<>();
                if (request.getAppName() != null) sourceInfo.put("appName", request.getAppName());
                if (request.getAppIconUrl() != null) sourceInfo.put("appIconUrl", request.getAppIconUrl());
                if (request.getAppDeepLinkCallback() != null) sourceInfo.put("appDeepLinkCallback", request.getAppDeepLinkCallback());
                payload.put("sourceInfo", sourceInfo);
            }

            return executePostRequest(url, payload, null);
        });
    }

    @Override
    public Mono<BakongResponse> checkTransactionByMD5(CheckTransactionRequest request, String requestUrl) {
        return reactiveExecutor.executeReactive("checkTransactionByMD5", () -> doCheckTransactionByMd5(request, requestUrl));
    }

    @Override
    public Mono<TransactionStatusResponse> checkTransactionStatus(CheckTransactionRequest request, String requestUrl) {
        return checkTransactionByMD5(request, requestUrl)
                .map(transactionStatusMapper::toStatus);
    }

    @Override
    public Mono<BakongResponse> checkTransactionByHash(CheckHashRequest request, String requestUrl) {
        return reactiveExecutor.executeReactive("checkTransactionByHash", () -> {
            String url = bakongProperties.getApiUrl() + "/v1/check_transaction_by_hash";
            log.info("Checking transaction by hash={} against upstreamUrl={}", request.getHash(), url);
            return executeAuthenticatedPost(url, Map.of("hash", request.getHash()), requestUrl, request);
        });
    }

    @Override
    public Mono<BakongResponse> checkBakongAccount(CheckAccountRequest request, String requestUrl) {
        return reactiveExecutor.executeReactive("checkBakongAccount", () -> {
            String url = bakongProperties.getApiUrl() + "/v1/check_bakong_account";
            log.info("Checking Bakong accountId={} against upstreamUrl={}", request.getAccountId(), url);
            return executeAuthenticatedPost(url, Map.of("accountId", request.getAccountId()), requestUrl, request);
        });
    }

    @Override
    public Mono<BakongResponse> checkTransactionByMd5List(CheckMd5ListRequest request, String requestUrl) {
        return reactiveExecutor.executeReactive("checkTransactionByMd5List", () -> {
            String url = bakongProperties.getApiUrl() + "/v1/check_transaction_by_md5_list";
            log.info("Checking transaction by MD5 list (size={}) against upstreamUrl={}", request.getMd5List().size(), url);
            return executeAuthenticatedPost(url, request.getMd5List(), requestUrl, request);
        });
    }

    @Override
    public Flux<ApiResponse<TransactionStatusResponse>> streamCheckTransaction(String md5, Integer intervalSeconds, String requestUrl) {
        return Flux.interval(Duration.ZERO, Duration.ofSeconds(intervalSeconds))
                .concatMap(tick -> checkTransactionByMD5(new CheckTransactionRequest(md5), requestUrl)
                        .map(response -> ApiResponse.success(
                                "Transaction status update",
                                transactionStatusMapper.toStreamingStatus(response, tick)
                        )))
                .takeUntil(apiResponse -> apiResponse.getData() != null && apiResponse.getData().isTerminal());
    }

    private BakongResponse doCheckTransactionByMd5(CheckTransactionRequest request, String requestUrl) {
        String url = bakongProperties.getApiUrl() + "/v1/check_transaction_by_md5";
        log.info("Checking transaction status for md5={} against upstreamUrl={}", request.getMd5(), url);
        BakongResponse response = executeAuthenticatedPost(url, Map.of("md5", request.getMd5()), requestUrl, request);
        updateTransactionRecordStatus(request.getMd5(), response);
        if (response.isSuccess()) {
            telegramNotifier.notifyTransactionChecked(requestUrl, url, request, response);
        }
        return response;
    }

    private BakongResponse executeAuthenticatedPost(String url, Object body, String requestUrl, Object originalRequest) {
        try {
            return executePostRequest(url, body, bakongTokenService.getToken());
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode() == HttpStatus.UNAUTHORIZED || ex.getStatusCode() == HttpStatus.FORBIDDEN) {
                log.warn("Bakong token rejected by upstream, renewing token and retrying request to {}", url);
                return executePostRequest(url, body, bakongTokenService.renewToken());
            }
            log.error("Upstream HTTP error status={} on url={}", ex.getStatusCode(), url);
            telegramNotifier.notifyIssue("Bakong API error", requestUrl, originalRequest, ex);
            throw new BakongUpstreamException("Bakong API request failed: HTTP " + ex.getStatusCode().value(), ex.getStatusCode().value(), ex.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Bakong API request failed on url={}: {}", url, e.getMessage());
            telegramNotifier.notifyIssue("Bakong API error", requestUrl, originalRequest, e);
            throw new BakongUpstreamException("Bakong API request failed: " + e.getMessage(), e);
        }
    }

    private BakongResponse executePostRequest(String url, Object body, String bearerToken) {
        var spec = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON);

        if (bearerToken != null && !bearerToken.isBlank()) {
            spec.header(HttpHeaders.AUTHORIZATION, "Bearer " + bearerToken);
        }

        String responseBody = spec.body(body).retrieve().body(String.class);
        try {
            return mapper.readValue(responseBody, BakongResponse.class);
        } catch (Exception ex) {
            log.error("Failed to parse Bakong response JSON: {}", responseBody);
            throw new BakongUpstreamException("Failed to parse Bakong response", 500, responseBody);
        }
    }

    private void saveTransactionRecord(BakongRequest request, KHQRData qrData) {
        try {
            BakongTransaction transaction = BakongTransaction.builder()
                    .md5(qrData.getMd5())
                    .merchantName(request.getMerchantName())
                    .amount(BigDecimal.valueOf(request.getAmount()))
                    .currency(request.getCurrency() != null ? request.getCurrency().name() : "KHR")
                    .status(TransactionState.NOT_SCANNED.name())
                    .toAccountId(bakongProperties.getAccountId())
                    .rawQrString(qrData.getQr())
                    .build();
            bakongTransactionRepository.save(transaction);
        } catch (Exception ex) {
            log.warn("Failed to persist BakongTransaction record for md5={}: {}", qrData.getMd5(), ex.getMessage());
        }
    }

    private void updateTransactionRecordStatus(String md5, BakongResponse response) {
        try {
            bakongTransactionRepository.findByMd5(md5).ifPresent(tx -> {
                if (response.isSuccess()) {
                    tx.setStatus(TransactionState.PAID.name());
                    if (response.getData() instanceof Map<?, ?> dataMap) {
                        Object hashObj = dataMap.get("hash");
                        if (hashObj != null) tx.setHash(hashObj.toString());
                        Object fromAcc = dataMap.get("fromAccountId");
                        if (fromAcc != null) tx.setFromAccountId(fromAcc.toString());
                        Object toAcc = dataMap.get("toAccountId");
                        if (toAcc != null) tx.setToAccountId(toAcc.toString());
                    }
                } else if (response.getResponseCode() == 1) {
                    tx.setStatus(TransactionState.WAITING_FOR_PAYMENT.name());
                } else {
                    tx.setStatus(TransactionState.FAILED.name());
                }
                BakongTransaction updated = bakongTransactionRepository.save(tx);
                log.info("Updated BakongTransaction status to {} for md5={}", updated.getStatus(), md5);
            });
        } catch (Exception ex) {
            log.warn("Failed to update status for BakongTransaction md5={}: {}", md5, ex.getMessage());
        }
    }
}
