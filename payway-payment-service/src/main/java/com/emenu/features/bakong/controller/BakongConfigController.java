package com.emenu.features.bakong.controller;

import com.emenu.config.OpenApiConfig;
import com.emenu.features.bakong.dto.BakongConfigCreateRequest;
import com.emenu.features.bakong.dto.BakongConfigResponse;
import com.emenu.features.bakong.dto.BakongConfigSearchRequest;
import com.emenu.features.bakong.dto.BakongConfigUpdateRequest;
import com.emenu.features.bakong.service.BakongConfigService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PageResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bakong-configs")
@RequiredArgsConstructor
@Validated
@SecurityRequirement(name = OpenApiConfig.API_KEY_SCHEME)
public class BakongConfigController {

    private final BakongConfigService service;

    @PostMapping("/get-all")
    public ResponseEntity<ApiResponse<PageResponse<BakongConfigResponse>>> getConfigsByBody(@RequestBody(required = false) BakongConfigSearchRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.getAllConfigs(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BakongConfigResponse>> getConfigDetail(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(ApiResponse.success(service.getConfigById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BakongConfigResponse>> createConfig(@Valid @RequestBody BakongConfigCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Bakong configuration created successfully", service.createConfig(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BakongConfigResponse>> updateConfig(
            @PathVariable("id") UUID id,
            @Valid @RequestBody BakongConfigUpdateRequest request
    ) {
        request.setId(id);
        return ResponseEntity.ok(ApiResponse.success("Bakong configuration updated successfully", service.updateConfig(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<BakongConfigResponse>> deleteConfig(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Bakong configuration deleted successfully", service.deleteConfig(id)));
    }
}
