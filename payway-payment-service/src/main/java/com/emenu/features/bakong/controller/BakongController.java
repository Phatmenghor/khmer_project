package com.emenu.features.bakong.controller;

import com.emenu.config.OpenApiConfig;
import com.emenu.features.bakong.dto.BakongQrResponse;
import com.emenu.features.bakong.dto.BakongRequest;
import com.emenu.features.bakong.dto.BakongResponse;
import com.emenu.features.bakong.dto.CheckAccountRequest;
import com.emenu.features.bakong.dto.CheckHashRequest;
import com.emenu.features.bakong.dto.CheckMd5ListRequest;
import com.emenu.features.bakong.dto.CheckTransactionRequest;
import com.emenu.features.bakong.dto.GenerateDeeplinkRequest;
import com.emenu.features.bakong.dto.StreamCheckTransactionRequest;
import com.emenu.features.bakong.dto.TransactionStatusResponse;
import com.emenu.features.bakong.service.BakongService;
import com.emenu.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/bakong")
@RequiredArgsConstructor
@Validated
@Tag(name = "Bakong Payment Gateway", description = "Official NBC Bakong Open API v1.0.5 Integration Endpoints")
@SecurityRequirement(name = OpenApiConfig.API_KEY_SCHEME)
public class BakongController {

    private final BakongService service;

    @Operation(summary = "Generate KHQR Payload", description = "Generates dynamic EMVCo KHQR code payload (Offline execution)")
    @PostMapping("/generate-qr")
    public Mono<ResponseEntity<ApiResponse<BakongQrResponse>>> generateQR(
            @Valid @RequestBody BakongRequest request,
            HttpServletRequest servletRequest
    ) {
        return service.generateQR(request, servletRequest.getRequestURL().toString())
                .map(response -> ResponseEntity.ok(ApiResponse.success("Bakong KHQR generated successfully", response)));
    }

    @Operation(summary = "Get KHQR Card PNG Image", description = "Renders official 600x775 PNG Merchant Payment Card without center logo overlay")
    @PostMapping(value = "/get-qr-image", produces = MediaType.IMAGE_PNG_VALUE)
    public Mono<ResponseEntity<byte[]>> getQRImage(
            @Valid @RequestBody CheckTransactionRequest request,
            HttpServletRequest servletRequest
    ) {
        return service.getQRImage(request, servletRequest.getRequestURL().toString())
                .map(imageBytes -> ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"khqr-merchant-card.png\"")
                        .contentType(MediaType.IMAGE_PNG)
                        .body(imageBytes));
    }

    @Operation(summary = "Generate App Deeplink", description = "Generates Bakong short link/deeplink URL from KHQR payload")
    @PostMapping("/generate-deeplink")
    public Mono<ResponseEntity<ApiResponse<BakongResponse>>> generateDeeplink(
            @Valid @RequestBody GenerateDeeplinkRequest request,
            HttpServletRequest servletRequest
    ) {
        return service.generateDeeplink(request, servletRequest.getRequestURL().toString())
                .map(response -> ResponseEntity.ok(ApiResponse.success("Bakong deeplink generated successfully", response)));
    }

    @Operation(summary = "Check Transaction Status by MD5", description = "Verifies payment transaction status by MD5 hash with NBC central bank ledger")
    @PostMapping("/check-transaction")
    public Mono<ResponseEntity<ApiResponse<TransactionStatusResponse>>> checkTransaction(
            @Valid @RequestBody CheckTransactionRequest request,
            HttpServletRequest servletRequest
    ) {
        return service.checkTransactionStatus(request, servletRequest.getRequestURL().toString())
                .map(status -> ResponseEntity.ok(ApiResponse.success("Bakong transaction status retrieved successfully", status)));
    }

    @Operation(summary = "Check Transaction Status by Full Hash", description = "Verifies payment transaction status by 64-char full transaction hash")
    @PostMapping("/check-transaction-by-hash")
    public Mono<ResponseEntity<ApiResponse<BakongResponse>>> checkTransactionByHash(
            @Valid @RequestBody CheckHashRequest request,
            HttpServletRequest servletRequest
    ) {
        return service.checkTransactionByHash(request, servletRequest.getRequestURL().toString())
                .map(response -> ResponseEntity.ok(ApiResponse.success("Transaction check by hash completed", response)));
    }

    @Operation(summary = "Check Bakong Account", description = "Verifies if a Bakong Account ID exists in NBC central system")
    @PostMapping("/check-account")
    public Mono<ResponseEntity<ApiResponse<BakongResponse>>> checkBakongAccount(
            @Valid @RequestBody CheckAccountRequest request,
            HttpServletRequest servletRequest
    ) {
        return service.checkBakongAccount(request, servletRequest.getRequestURL().toString())
                .map(response -> ResponseEntity.ok(ApiResponse.success("Bakong account check completed", response)));
    }

    @Operation(summary = "Check Transaction Status by MD5 List", description = "Batch verifies status for up to 50 MD5 transaction hashes")
    @PostMapping("/check-transaction-by-md5-list")
    public Mono<ResponseEntity<ApiResponse<BakongResponse>>> checkTransactionByMd5List(
            @Valid @RequestBody CheckMd5ListRequest request,
            HttpServletRequest servletRequest
    ) {
        return service.checkTransactionByMd5List(request, servletRequest.getRequestURL().toString())
                .map(response -> ResponseEntity.ok(ApiResponse.success("Batch MD5 transaction check completed", response)));
    }

    @Operation(summary = "Stream Transaction Status (SSE)", description = "Real-time Server-Sent Events stream polling transaction status")
    @GetMapping(value = "/check-transaction/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ApiResponse<TransactionStatusResponse>> streamCheckTransaction(
            @Valid StreamCheckTransactionRequest request,
            HttpServletRequest servletRequest
    ) {
        return service.streamCheckTransaction(request.getMd5(), request.getIntervalSeconds(), servletRequest.getRequestURL().toString());
    }
}
