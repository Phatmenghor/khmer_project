package com.emenu.features.bakong.service.impl;

import com.emenu.constant.BakongApiConstants;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.emenu.config.exception.BakongPaymentException;
import com.emenu.config.exception.BakongUpstreamException;
import com.emenu.util.BakongReactiveExecutor;
import com.emenu.features.bakong.dto.BakongMonitoringStatusResponse;
import com.emenu.features.bakong.dto.BakongQrResponse;
import com.emenu.features.bakong.dto.BakongRequest;
import com.emenu.features.bakong.dto.BakongResponse;
import com.emenu.features.bakong.dto.CheckAccountRequest;
import com.emenu.features.bakong.dto.CheckHashRequest;
import com.emenu.features.bakong.dto.CheckMd5ListRequest;
import com.emenu.features.bakong.dto.CheckTransactionRequest;
import com.emenu.features.bakong.dto.TransactionStatusResponse;
import com.emenu.enums.TransactionState;
import com.emenu.features.bakong.model.BakongTransactionLog;
import com.emenu.features.bakong.repository.BakongTransactionLogRepository;
import com.emenu.features.bakong.notifier.TelegramNotifier;
import com.emenu.features.bakong.mapper.BakongTransactionMapper;
import com.emenu.features.bakong.mapper.MerchantInfoMapper;
import com.emenu.features.bakong.mapper.TransactionStatusMapper;
import com.emenu.features.bakong.model.BakongAccount;
import com.emenu.features.bakong.model.BakongConfig;
import com.emenu.features.bakong.model.BakongTransaction;
import com.emenu.features.bakong.repository.BakongAccountRepository;
import com.emenu.features.bakong.repository.BakongConfigRepository;
import com.emenu.features.bakong.repository.BakongTransactionRepository;
import com.emenu.features.bakong.service.BakongRateLimiterService;
import com.emenu.features.bakong.service.BakongService;
import com.emenu.features.bakong.service.BakongTokenService;
import com.emenu.features.bakong.util.TransactionIdGenerator;
import com.emenu.util.QrImageUtils;
import kh.gov.nbc.bakong_khqr.BakongKHQR;
import kh.gov.nbc.bakong_khqr.model.KHQRData;
import kh.gov.nbc.bakong_khqr.model.KHQRResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
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
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BakongServiceImpl implements BakongService {

    private final RestClient restClient;
    private final ObjectMapper mapper;
    private final BakongConfigRepository bakongConfigRepository;
    private final BakongAccountRepository bakongAccountRepository;
    private final BakongTokenService bakongTokenService;
    private final BakongRateLimiterService bakongRateLimiterService;
    private final MerchantInfoMapper merchantInfoMapper;
    private final TransactionStatusMapper transactionStatusMapper;
    private final TelegramNotifier telegramNotifier;
    private final BakongReactiveExecutor reactiveExecutor;
    private final BakongTransactionRepository bakongTransactionRepository;
    private final BakongTransactionLogRepository bakongTransactionLogRepository;
    private final BakongTransactionMapper transactionMapper;

    private String getBakongApiUrl() {
        return bakongConfigRepository.findTopByEnabledTrue()
                .map(BakongConfig::getApiUrl)
                .filter(url -> url != null && !url.isBlank())
                .orElseThrow(() -> new BakongPaymentException("No active Bakong API URL configuration found in database table"));
    }

    private String getBakongAccountId() {
        return bakongAccountRepository.findTopByIsDefaultTrueAndEnabledTrue()
                .or(() -> bakongAccountRepository.findTopByEnabledTrue())
                .map(BakongAccount::getAccountId)
                .filter(id -> id != null && !id.isBlank())
                .orElseThrow(() -> new BakongPaymentException("No active Bakong Account ID found in database table"));
    }

    @Override
    public Mono<BakongQrResponse> generateQR(BakongRequest bakongRequest, String requestUrl) {
        return reactiveExecutor.executeReactive("generateQR", () -> {
            log.info("Generating Bakong KHQR for merchantName={}, amount={} {}",
                    bakongRequest != null ? bakongRequest.getMerchantName() : null,
                    bakongRequest != null ? bakongRequest.getAmount() : null,
                    bakongRequest != null ? bakongRequest.getCurrency() : null);
            try {
                KHQRResponse<KHQRData> response = BakongKHQR.generateMerchant(
                        merchantInfoMapper.toMerchantInfo(bakongRequest, getBakongAccountId())
                );

                if (response == null || (response.getKHQRStatus() != null && response.getKHQRStatus().getCode() != 0)) {
                    String statusMsg = (response != null && response.getKHQRStatus() != null) ? response.getKHQRStatus().getMessage() : "Unknown error";
                    log.error("Bakong KHQR generation error: message={}", statusMsg);
                    throw new BakongPaymentException("Bakong KHQR Generation Error: " + statusMsg);
                }

                KHQRData qrData = response.getData();
                String qr = qrData == null ? null : qrData.getQr();
                String md5 = qrData == null ? null : qrData.getMd5();

                BakongTransaction savedTx = null;
                if (qrData != null) {
                    savedTx = saveTransactionRecord(bakongRequest, qrData);
                }
                String txnId = savedTx != null ? savedTx.getTransactionId() : null;

                log.info("KHQR generated successfully, transactionId={}, md5={}", txnId, md5);
                telegramNotifier.notifyQrGenerated(requestUrl, bakongRequest, response);

                return BakongQrResponse.builder()
                        .transactionId(txnId)
                        .qr(qr)
                        .md5(md5)
                        .build();
            } catch (Exception ex) {
                log.error("Failed to generate Bakong KHQR for merchantName={}: {}",
                        bakongRequest != null ? bakongRequest.getMerchantName() : null, ex.getMessage());
                telegramNotifier.notifyIssue("QR generation failed", requestUrl, bakongRequest, ex);
                throw new BakongPaymentException("Failed to generate Bakong KHQR: " + ex.getMessage(), ex);
            }
        });
    }

    @Override
    public Mono<byte[]> getQRImage(CheckTransactionRequest request, String requestUrl) {
        return reactiveExecutor.executeReactive("getQRImage", () -> {
            if (request == null || request.getTransactionId() == null || request.getTransactionId().isBlank()) {
                throw new BakongPaymentException("Transaction ID is required for QR image generation");
            }
            String txnId = request.getTransactionId();
            BakongTransaction tx = bakongTransactionRepository.findByTransactionId(txnId)
                    .or(() -> bakongTransactionRepository.findByMd5(txnId))
                    .orElseThrow(() -> new BakongPaymentException("Bakong Transaction not found for ID: " + txnId));

            if (tx.getRawQrString() == null || tx.getRawQrString().isBlank()) {
                throw new BakongPaymentException("Stored QR payload is empty for Transaction ID: " + txnId);
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
            String url = getBakongApiUrl() + BakongApiConstants.CHECK_TRANSACTION_BY_HASH_ENDPOINT;
            log.info("Checking transaction by hash={} against upstreamUrl={}", request.getHash(), url);
            BakongResponse response = executeAuthenticatedPost(url, Map.of("hash", request.getHash()), requestUrl, request, true);
            updateTransactionRecordStatus(null, request.getHash(), response, "CHECK_BY_HASH");
            if (response != null && response.isSuccess()) {
                telegramNotifier.notifyIssue("Bakong Transaction Verified by Hash", requestUrl, Map.of("hash", request.getHash(), "response", response), null);
            }
            return response;
        });
    }

    @Override
    public Mono<BakongResponse> checkBakongAccount(CheckAccountRequest request, String requestUrl) {
        return reactiveExecutor.executeReactive("checkBakongAccount", () -> {
            String targetAccountId = (request != null && request.getAccountId() != null && !request.getAccountId().isBlank())
                    ? request.getAccountId().trim()
                    : getBakongAccountId();
            String url = getBakongApiUrl() + BakongApiConstants.CHECK_BAKONG_ACCOUNT_ENDPOINT;
            log.info("Checking Bakong accountId={} against upstreamUrl={}", targetAccountId, url);
            BakongResponse response = executeAuthenticatedPost(url, Map.of("accountId", targetAccountId), requestUrl, request, false);
            return response;
        });
    }

    @Override
    public Mono<BakongResponse> checkTransactionByMd5List(CheckMd5ListRequest request, String requestUrl) {
        return reactiveExecutor.executeReactive("checkTransactionByMd5List", () -> {
            if (request == null || request.getTransactionIds() == null || request.getTransactionIds().isEmpty()) {
                throw new BakongPaymentException("Transaction ID list cannot be empty");
            }
            List<String> txnIds = request.getTransactionIds();
            List<String> md5List = txnIds.stream()
                    .map(id -> bakongTransactionRepository.findByTransactionId(id)
                            .or(() -> bakongTransactionRepository.findByMd5(id))
                            .map(BakongTransaction::getMd5)
                            .orElse(id))
                    .collect(Collectors.toList());

            String url = getBakongApiUrl() + BakongApiConstants.CHECK_TRANSACTION_BY_MD5_LIST_ENDPOINT;
            log.info("Checking transaction by list (size={}) against upstreamUrl={}", md5List.size(), url);
            BakongResponse response = executeAuthenticatedPost(url, md5List, requestUrl, request, true);
            if (md5List != null) {
                md5List.forEach(md5 -> updateTransactionRecordStatus(md5, null, response, "CHECK_BY_LIST"));
            }
            return response;
        });
    }

    @Override
    public Flux<TransactionStatusResponse> streamCheckTransaction(String transactionId, Integer intervalSeconds, String requestUrl) {
        if (transactionId == null || transactionId.isBlank()) {
            return Flux.error(new BakongPaymentException("Transaction ID is required for streaming status"));
        }
        int interval = (intervalSeconds != null && intervalSeconds > 0) ? intervalSeconds : 3;
        return Flux.interval(Duration.ZERO, Duration.ofSeconds(interval))
                .concatMap(tick -> checkTransactionByMD5(new CheckTransactionRequest(transactionId), requestUrl)
                        .map(response -> transactionStatusMapper.toStreamingStatus(response, tick)))
                .takeUntil(TransactionStatusResponse::isTerminal);
    }

    private BakongResponse doCheckTransactionByMd5(CheckTransactionRequest request, String requestUrl) {
        if (request == null || request.getTransactionId() == null || request.getTransactionId().isBlank()) {
            throw new BakongPaymentException("Transaction ID is required to check transaction status");
        }
        String txnId = request.getTransactionId();
        BakongTransaction tx = bakongTransactionRepository.findByTransactionId(txnId)
                .or(() -> bakongTransactionRepository.findByMd5(txnId))
                .orElseThrow(() -> new BakongPaymentException("Transaction not found for ID: " + txnId));

        String md5 = tx.getMd5();
        String url = getBakongApiUrl() + BakongApiConstants.CHECK_TRANSACTION_BY_MD5_ENDPOINT;
        log.info("Checking transaction status for transactionId={} (md5={}) against upstreamUrl={}", txnId, md5, url);
        BakongResponse response = executeAuthenticatedPost(url, Map.of("md5", md5), requestUrl, request, true);
        updateTransactionRecordStatus(md5, null, response, "CHECK_BY_TRANSACTION_ID");
        if (response != null && response.isSuccess()) {
            telegramNotifier.notifyTransactionChecked(requestUrl, url, request, response);
        }
        return response;
    }

    private BakongResponse executeAuthenticatedPost(String url, Object body, String requestUrl, Object originalRequest, boolean countQuota) {
        String targetEmail = null;
        String targetUrl = url;

        if (countQuota) {
            BakongConfig activeConfig = bakongRateLimiterService.selectAndIncrementActiveQuota(url);
            targetEmail = activeConfig.getEmail();
            if (activeConfig.getApiUrl() != null && !activeConfig.getApiUrl().isBlank() && url.contains("/v1/")) {
                targetUrl = activeConfig.getApiUrl() + url.substring(url.indexOf("/v1/"));
            }
        }

        String bearerToken = bakongTokenService.getTokenForEmail(targetEmail);

        try {
            return executePostRequest(targetUrl, body, bearerToken);
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode() == HttpStatus.UNAUTHORIZED || ex.getStatusCode() == HttpStatus.FORBIDDEN) {
                log.warn("Bakong token rejected by upstream for email={}, renewing token and retrying request to {}", targetEmail, targetUrl);
                String renewedToken = bakongTokenService.renewTokenForEmail(targetEmail);
                return executePostRequest(targetUrl, body, renewedToken);
            }
            log.error("Upstream HTTP error status={} on url={}", ex.getStatusCode(), targetUrl);
            telegramNotifier.notifyIssue("Bakong API error", requestUrl, originalRequest, ex);
            throw new BakongUpstreamException("Bakong API request failed: HTTP " + ex.getStatusCode().value(), ex.getStatusCode().value(), ex.getResponseBodyAsString());
        } catch (Exception e) {
            if (e instanceof BakongUpstreamException bue) {
                throw bue;
            }
            log.error("Bakong API request failed on url={}: {}", targetUrl, e.getMessage());
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

    private BakongTransaction saveTransactionRecord(BakongRequest request, KHQRData qrData) {
        try {
            String apiKey = org.slf4j.MDC.get("apiKey");
            String projectCode = org.slf4j.MDC.get("projectCode");
            String transactionId = TransactionIdGenerator.generateTransactionId();

            BakongTransaction transaction = BakongTransaction.builder()
                    .transactionId(transactionId)
                    .projectCode(projectCode != null && !projectCode.isBlank() ? projectCode : "EMENU_WEB")
                    .apiKey(apiKey)
                    .md5(qrData != null ? qrData.getMd5() : null)
                    .merchantName(request != null ? request.getMerchantName() : null)
                    .amount(request != null && request.getAmount() != null ? BigDecimal.valueOf(request.getAmount()) : BigDecimal.ZERO)
                    .currency(request != null && request.getCurrency() != null ? request.getCurrency().name() : "KHR")
                    .status(TransactionState.NOT_SCANNED.name())
                    .toAccountId(getBakongAccountId())
                    .rawQrString(qrData != null ? qrData.getQr() : null)
                    .build();
            BakongTransaction savedTx = bakongTransactionRepository.save(transaction);

            BakongTransactionLog logEntry = transactionMapper.toLogEntity(savedTx, "QR_GENERATED", null, null);
            if (logEntry != null) {
                bakongTransactionLogRepository.save(logEntry);
            }
            log.info("Saved initial BakongTransaction and BakongTransactionLog for transactionId={}, md5={}", transactionId, qrData != null ? qrData.getMd5() : null);
            return savedTx;
        } catch (Exception ex) {
            log.warn("Failed to persist BakongTransaction record: {}", ex.getMessage());
            return null;
        }
    }

    private void updateTransactionRecordStatus(String md5, String hash, BakongResponse response, String actionName) {
        try {
            Optional<BakongTransaction> optionalTx = Optional.empty();
            if (md5 != null && !md5.isBlank()) {
                optionalTx = bakongTransactionRepository.findByMd5(md5);
            }
            if (optionalTx.isEmpty() && hash != null && !hash.isBlank()) {
                optionalTx = bakongTransactionRepository.findByHash(hash);
            }

            String respJson = null;
            try {
                respJson = mapper.writeValueAsString(response);
            } catch (Exception ignore) {}

            final String finalRespJson = respJson;

            optionalTx.ifPresent(tx -> {
                tx.setResponseJson(finalRespJson);
                if (response.isSuccess()) {
                    tx.setStatus(TransactionState.PAID.name());
                    if (response.getData() instanceof Map<?, ?> dataMap) {
                        Object hashObj = dataMap.get("hash");
                        if (hashObj != null) tx.setHash(hashObj.toString());
                        Object fromAcc = dataMap.get("fromAccountId");
                        if (fromAcc != null) tx.setFromAccountId(fromAcc.toString());
                        Object toAcc = dataMap.get("toAccountId");
                        if (toAcc != null) tx.setToAccountId(toAcc.toString());
                        Object amtObj = dataMap.get("amount");
                        if (amtObj != null) {
                            try { tx.setAmount(new BigDecimal(amtObj.toString())); } catch (Exception ignore) {}
                        }
                        Object currObj = dataMap.get("currency");
                        if (currObj != null) tx.setCurrency(currObj.toString());
                    }
                } else if (response.getResponseCode() == 1) {
                    tx.setStatus(TransactionState.WAITING_FOR_PAYMENT.name());
                } else {
                    tx.setStatus(TransactionState.FAILED.name());
                }
                BakongTransaction updated = bakongTransactionRepository.save(tx);
                log.info("Updated BakongTransaction status to {} for md5={} hash={}", updated.getStatus(), md5, hash);

                BakongTransactionLog logEntry = transactionMapper.toLogEntity(
                        updated,
                        actionName != null ? actionName : "CHECK_STATUS",
                        finalRespJson,
                        response.getResponseMessage()
                );
                bakongTransactionLogRepository.save(logEntry);
            });
        } catch (Exception ex) {
            log.warn("Failed to update status for BakongTransaction md5={} hash={}: {}", md5, hash, ex.getMessage());
        }
    }

    @Override
    public Mono<BakongMonitoringStatusResponse> getMonitoringStatus() {
        return reactiveExecutor.executeReactive("getMonitoringStatus", () -> {
            var quotaInfo = bakongRateLimiterService.getQuotaInfo();
            var tokenInfo = bakongTokenService.getTokenStatusInfo();
            return BakongMonitoringStatusResponse.builder()
                    .quota(quotaInfo)
                    .token(tokenInfo)
                    .build();
        });
    }
}

