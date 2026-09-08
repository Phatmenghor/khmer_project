package com.emenu.features.bakong.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.emenu.config.exception.BakongPaymentException;
import com.emenu.config.exception.BakongUpstreamException;
import com.emenu.features.bakong.component.BakongReactiveExecutor;
import com.emenu.features.bakong.dto.BakongRequest;
import com.emenu.features.bakong.dto.BakongResponse;
import com.emenu.features.bakong.dto.CheckTransactionRequest;
import com.emenu.features.bakong.dto.TransactionStatusResponse;
import com.emenu.features.bakong.enums.TransactionState;
import com.emenu.features.bakong.integration.telegram.TelegramNotifier;
import com.emenu.features.bakong.mapper.MerchantInfoMapper;
import com.emenu.features.bakong.mapper.TransactionStatusMapper;
import com.emenu.features.bakong.model.BakongTransaction;
import com.emenu.features.bakong.repository.BakongTransactionRepository;
import com.emenu.features.bakong.service.BakongService;
import com.emenu.features.bakong.service.BakongTokenService;
import com.emenu.features.bakong.util.QrImageUtils;
import com.emenu.shared.dto.ApiResponse;
import kh.gov.nbc.bakong_khqr.BakongKHQR;
import kh.gov.nbc.bakong_khqr.model.KHQRData;
import kh.gov.nbc.bakong_khqr.model.KHQRResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BakongServiceImpl implements BakongService {

    private final RestClient restClient;
    private final ObjectMapper mapper;
    private final BakongTokenService bakongTokenService;
    private final MerchantInfoMapper merchantInfoMapper;
    private final TransactionStatusMapper transactionStatusMapper;
    private final TelegramNotifier telegramNotifier;
    private final BakongReactiveExecutor reactiveExecutor;
    private final BakongTransactionRepository bakongTransactionRepository;

    @Value("${bakong.account-id}")
    private String bakongAccountId;

    @Value("${bakong.base-url}")
    private String baseUrl;

    @Override
    public Mono<KHQRResponse<KHQRData>> generateQR(BakongRequest bakongRequest, String requestUrl) {
        return reactiveExecutor.executeReactive("generateQR", () -> {
            log.info("Generating Bakong KHQR for merchantName={}, amount={} {}",
                    bakongRequest.getMerchantName(),
                    bakongRequest.getAmount(),
                    bakongRequest.getCurrency());
            try {
                KHQRResponse<KHQRData> response = BakongKHQR.generateMerchant(
                        merchantInfoMapper.toMerchantInfo(bakongRequest, bakongAccountId)
                );

                String md5 = response.getData() == null ? null : response.getData().getMd5();
                log.info("KHQR generated successfully, md5={}", md5);

                if (response.getData() != null && md5 != null) {
                    saveTransactionRecord(bakongRequest, response.getData());
                    log.info("Persisted BakongTransaction record in DB table for md5={}", md5);
                }

                telegramNotifier.notifyQrGenerated(requestUrl, bakongRequest, response);
                return response;
            } catch (Exception ex) {
                log.error("Failed to generate Bakong KHQR for merchantName={} amount={}: {}",
                        bakongRequest.getMerchantName(),
                        bakongRequest.getAmount(),
                        ex.getMessage());
                telegramNotifier.notifyIssue("QR generation failed", requestUrl, bakongRequest, ex);
                throw new BakongPaymentException("Failed to generate Bakong KHQR: " + ex.getMessage(), ex);
            }
        });
    }

    @Override
    public Mono<byte[]> getQRImage(KHQRData qr, String requestUrl) {
        return reactiveExecutor.executeReactive("getQRImage", () -> {
            try {
                if (qr == null || qr.getQr() == null || qr.getQr().isBlank()) {
                    log.warn("Received empty QR payload for image generation");
                    throw new BakongPaymentException("Invalid or empty QR data payload");
                }

                log.info("Encoding ZXing PNG QR image for payload length={}", qr.getQr().length());
                byte[] imageBytes = QrImageUtils.generatePngQrCode(qr.getQr(), 300, 300);

                log.info("Bakong QR image generated successfully size={} bytes", imageBytes.length);
                return imageBytes;
            } catch (Exception e) {
                log.error("Unexpected QR image generation error: {}", e.getMessage());
                telegramNotifier.notifyIssue("QR image generation failed", requestUrl, qr, e);
                throw new BakongPaymentException("QR image generation failed: " + e.getMessage(), e);
            }
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
        String url = baseUrl.replaceAll("/+$", "") + "/v1/check_transaction_by_md5";
        log.info("Checking transaction status for md5={} against upstreamUrl={}", request.getMd5(), url);

        try {
            String responseBody = doCheckTransactionRequest(url, request, bakongTokenService.getToken());
            BakongResponse response = mapper.readValue(responseBody, BakongResponse.class);

            log.info("Upstream response received for md5={}, responseCode={}, message={}",
                    request.getMd5(),
                    response.getResponseCode(),
                    response.getResponseMessage());

            updateTransactionRecordStatus(request.getMd5(), response);

            if (response.isSuccess()) {
                telegramNotifier.notifyTransactionChecked(requestUrl, url, request, response);
            }
            return response;
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode() == HttpStatus.UNAUTHORIZED || ex.getStatusCode() == HttpStatus.FORBIDDEN) {
                log.warn("Bakong token rejected by upstream for md5={}, renewing token and retrying", request.getMd5());
                return retryCheckTransaction(url, request, requestUrl);
            }

            log.error("Transaction check failed status={} for md5={}", ex.getStatusCode(), request.getMd5());
            telegramNotifier.notifyIssue("Transaction check failed", requestUrl, request, ex);
            throw new BakongUpstreamException("Transaction check failed status=" + ex.getStatusCode(), ex.getStatusCode().value(), ex.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Transaction check failed for md5={}: {}", request.getMd5(), e.getMessage());
            telegramNotifier.notifyIssue("Transaction check failed", requestUrl, request, e);
            throw new BakongUpstreamException("Transaction check failed: " + e.getMessage(), e);
        }
    }

    private BakongResponse retryCheckTransaction(String url, CheckTransactionRequest request, String requestUrl) {
        log.info("Retrying transaction check with renewed token for md5={}", request.getMd5());
        try {
            String responseBody = doCheckTransactionRequest(url, request, bakongTokenService.renewToken());
            BakongResponse response = mapper.readValue(responseBody, BakongResponse.class);

            log.info("Transaction check retry succeeded for md5={}, responseCode={}", request.getMd5(), response.getResponseCode());
            updateTransactionRecordStatus(request.getMd5(), response);

            if (response.isSuccess()) {
                telegramNotifier.notifyTransactionChecked(requestUrl, url, request, response);
            }
            return response;
        } catch (Exception ex) {
            log.error("Transaction check retry failed for md5={}: {}", request.getMd5(), ex.getMessage());
            telegramNotifier.notifyIssue("Transaction check failed", requestUrl, request, ex);
            throw new BakongUpstreamException("Transaction check retry failed: " + ex.getMessage(), ex);
        }
    }

    private String doCheckTransactionRequest(String url, CheckTransactionRequest request, String bearerToken) {
        return restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + bearerToken)
                .body(Map.of("md5", request.getMd5()))
                .retrieve()
                .body(String.class);
    }

    private void saveTransactionRecord(BakongRequest request, KHQRData qrData) {
        try {
            BakongTransaction transaction = BakongTransaction.builder()
                    .md5(qrData.getMd5())
                    .amount(BigDecimal.valueOf(request.getAmount()))
                    .currency(request.getCurrency() != null ? request.getCurrency().name() : "KHR")
                    .status(TransactionState.NOT_SCANNED.name())
                    .toAccountId(bakongAccountId)
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
                } else if (response.getResponseCode() == 1) {
                    tx.setStatus(TransactionState.WAITING_FOR_PAYMENT.name());
                } else {
                    tx.setStatus(TransactionState.FAILED.name());
                }
                bakongTransactionRepository.save(tx);
            });
        } catch (Exception ex) {
            log.warn("Failed to update status for BakongTransaction md5={}: {}", md5, ex.getMessage());
        }
    }
}
