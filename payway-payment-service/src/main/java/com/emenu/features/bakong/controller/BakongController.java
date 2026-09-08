package com.emenu.features.bakong.controller;

import com.emenu.config.OpenApiConfig;
import com.emenu.features.bakong.dto.BakongQrImageRequest;
import com.emenu.features.bakong.dto.BakongRequest;
import com.emenu.features.bakong.dto.CheckTransactionRequest;
import com.emenu.features.bakong.dto.StreamCheckTransactionRequest;
import com.emenu.features.bakong.dto.TransactionStatusResponse;
import com.emenu.features.bakong.service.BakongService;
import com.emenu.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import kh.gov.nbc.bakong_khqr.model.KHQRData;
import kh.gov.nbc.bakong_khqr.model.KHQRResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/bakong")
@RequiredArgsConstructor
@Validated
@SecurityRequirement(name = OpenApiConfig.API_KEY_SCHEME)
public class BakongController {

    private final BakongService service;

    @PostMapping("/generate-qr")
    public Mono<ResponseEntity<ApiResponse<KHQRResponse<KHQRData>>>> generateQR(
            @Parameter(description = "API Key (or use Authorize button at top)", in = ParameterIn.HEADER)
            @RequestHeader(value = "X-Api-Key", required = false) String apiKey,
            @Valid @RequestBody BakongRequest request,
            HttpServletRequest servletRequest
    ) {
        return service.generateQR(request, servletRequest.getRequestURL().toString())
                .map(response -> ResponseEntity.ok(ApiResponse.success("Bakong KHQR generated successfully", response)));
    }

    @PostMapping("/get-qr-image")
    public Mono<ResponseEntity<byte[]>> getQRImage(
            @Parameter(description = "API Key (or use Authorize button at top)", in = ParameterIn.HEADER)
            @RequestHeader(value = "X-Api-Key", required = false) String apiKey,
            @Valid @RequestBody BakongQrImageRequest request,
            HttpServletRequest servletRequest
    ) {
        KHQRData qrData = new KHQRData();
        qrData.setQr(request.getQr());
        return service.getQRImage(qrData, servletRequest.getRequestURL().toString())
                .map(imageBytes -> ResponseEntity
                        .ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"qrcode.png\"")
                        .contentType(MediaType.IMAGE_PNG)
                        .body(imageBytes));
    }

    @PostMapping("/check-transaction")
    public Mono<ResponseEntity<ApiResponse<TransactionStatusResponse>>> checkTransaction(
            @Parameter(description = "API Key (or use Authorize button at top)", in = ParameterIn.HEADER)
            @RequestHeader(value = "X-Api-Key", required = false) String apiKey,
            @Valid @RequestBody CheckTransactionRequest request,
            HttpServletRequest servletRequest
    ) {
        return service.checkTransactionStatus(request, servletRequest.getRequestURL().toString())
                .map(status -> ResponseEntity.ok(ApiResponse.success("Bakong transaction status retrieved successfully", status)));
    }

    @PostMapping(value = "/check-transaction/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ApiResponse<TransactionStatusResponse>> streamCheckTransaction(
            @Parameter(description = "API Key (or use Authorize button at top)", in = ParameterIn.HEADER)
            @RequestHeader(value = "X-Api-Key", required = false) String apiKey,
            @Valid @RequestBody StreamCheckTransactionRequest request,
            HttpServletRequest servletRequest
    ) {
        return service.streamCheckTransaction(request.getMd5(), request.getIntervalSeconds(), servletRequest.getRequestURL().toString());
    }

    @GetMapping(value = "/check-transaction/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ApiResponse<TransactionStatusResponse>> streamCheckTransactionGet(
            @Parameter(description = "API Key (or use Authorize button at top)", in = ParameterIn.HEADER)
            @RequestHeader(value = "X-Api-Key", required = false) String apiKey,
            @Valid StreamCheckTransactionRequest request,
            HttpServletRequest servletRequest
    ) {
        return service.streamCheckTransaction(request.getMd5(), request.getIntervalSeconds(), servletRequest.getRequestURL().toString());
    }
}
