package com.emenu.features.bakong.controller;

import com.emenu.config.OpenApiConfig;
import com.emenu.constant.ApiEndpoints;
import com.emenu.features.bakong.dto.BakongMonitoringStatusResponse;
import com.emenu.features.bakong.dto.BakongQrResponse;
import com.emenu.features.bakong.dto.BakongRequest;
import com.emenu.features.bakong.dto.BakongResponse;
import com.emenu.features.bakong.dto.CheckAccountRequest;
import com.emenu.features.bakong.dto.CheckHashRequest;
import com.emenu.features.bakong.dto.CheckMd5ListRequest;
import com.emenu.features.bakong.dto.CheckTransactionRequest;
import com.emenu.features.bakong.dto.StreamCheckTransactionRequest;
import com.emenu.features.bakong.dto.TransactionStatusResponse;
import com.emenu.features.bakong.service.BakongService;
import com.emenu.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping(ApiEndpoints.BAKONG_BASE)
@RequiredArgsConstructor
@Validated
@SecurityRequirement(name = OpenApiConfig.API_KEY_SCHEME)
public class BakongController {

    private final BakongService service;

    @PostMapping(ApiEndpoints.BAKONG_GENERATE_QR)
    public Mono<ApiResponse<BakongQrResponse>> generateQR(
            @Valid @RequestBody BakongRequest request,
            HttpServletRequest servletRequest
    ) {
        return service.generateQR(request, servletRequest.getRequestURL().toString())
                .map(ApiResponse::success);
    }

    @PostMapping(value = ApiEndpoints.BAKONG_GET_QR_IMAGE, produces = MediaType.IMAGE_PNG_VALUE)
    public Mono<byte[]> getQRImage(
            @Valid @RequestBody CheckTransactionRequest request,
            HttpServletRequest servletRequest
    ) {
        return service.getQRImage(request, servletRequest.getRequestURL().toString());
    }

    @PostMapping(ApiEndpoints.BAKONG_CHECK_TRANSACTION)
    public Mono<ApiResponse<TransactionStatusResponse>> checkTransaction(
            @Valid @RequestBody CheckTransactionRequest request,
            HttpServletRequest servletRequest
    ) {
        return service.checkTransactionStatus(request, servletRequest.getRequestURL().toString())
                .map(ApiResponse::success);
    }

    @PostMapping(ApiEndpoints.BAKONG_CHECK_TRANSACTION_BY_HASH)
    public Mono<ApiResponse<BakongResponse>> checkTransactionByHash(
            @Valid @RequestBody CheckHashRequest request,
            HttpServletRequest servletRequest
    ) {
        return service.checkTransactionByHash(request, servletRequest.getRequestURL().toString())
                .map(ApiResponse::success);
    }

    @PostMapping(ApiEndpoints.BAKONG_CHECK_ACCOUNT)
    public Mono<ApiResponse<BakongResponse>> checkBakongAccount(
            @Valid @RequestBody CheckAccountRequest request,
            HttpServletRequest servletRequest
    ) {
        return service.checkBakongAccount(request, servletRequest.getRequestURL().toString())
                .map(ApiResponse::success);
    }

    @PostMapping(ApiEndpoints.BAKONG_CHECK_TRANSACTION_BY_MD5_LIST)
    public Mono<ApiResponse<BakongResponse>> checkTransactionByMd5List(
            @Valid @RequestBody CheckMd5ListRequest request,
            HttpServletRequest servletRequest
    ) {
        return service.checkTransactionByMd5List(request, servletRequest.getRequestURL().toString())
                .map(ApiResponse::success);
    }

    @GetMapping(value = ApiEndpoints.BAKONG_STREAM_CHECK_TRANSACTION, produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<TransactionStatusResponse> streamCheckTransaction(
            @Valid StreamCheckTransactionRequest request,
            HttpServletRequest servletRequest
    ) {
        int interval = (request != null && request.getIntervalSeconds() != null && request.getIntervalSeconds() > 0)
                ? request.getIntervalSeconds()
                : 3;
        return service.streamCheckTransaction(request.getMd5(), interval, servletRequest.getRequestURL().toString());
    }

    @GetMapping(ApiEndpoints.BAKONG_STATUS)
    public Mono<ApiResponse<BakongMonitoringStatusResponse>> getMonitoringStatus() {
        return service.getMonitoringStatus()
                .map(ApiResponse::success);
    }
}
