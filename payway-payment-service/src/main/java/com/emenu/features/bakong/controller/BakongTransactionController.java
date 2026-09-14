package com.emenu.features.bakong.controller;

import com.emenu.config.OpenApiConfig;
import com.emenu.features.bakong.dto.BakongTransactionDetailResponse;
import com.emenu.features.bakong.dto.BakongTransactionResponse;
import com.emenu.features.bakong.dto.BakongTransactionSearchRequest;
import com.emenu.features.bakong.dto.BakongVerifyRequest;
import com.emenu.features.bakong.dto.BakongVerifyResponse;
import com.emenu.features.bakong.service.BakongTransactionService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PageResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bakong-transactions")
@RequiredArgsConstructor
@Validated
@SecurityRequirement(name = OpenApiConfig.API_KEY_SCHEME)
public class BakongTransactionController {

    private final BakongTransactionService service;

    @PostMapping("/get-all")
    public ResponseEntity<ApiResponse<PageResponse<BakongTransactionResponse>>> searchTransactions(
            @RequestBody(required = false) BakongTransactionSearchRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.searchTransactions(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BakongTransactionDetailResponse>> getTransactionDetail(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(ApiResponse.success(service.getTransactionDetail(id)));
    }

    @PostMapping("/verify")
    public Mono<ApiResponse<BakongVerifyResponse>> verifyTransaction(
            @Valid @RequestBody BakongVerifyRequest request,
            HttpServletRequest servletRequest
    ) {
        return service.verifyTransaction(request, servletRequest.getRequestURL().toString())
                .map(ApiResponse::success);
    }
}
