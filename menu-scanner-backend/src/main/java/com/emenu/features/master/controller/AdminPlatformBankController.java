package com.emenu.features.master.controller;

import com.emenu.features.master.dto.filter.PlatformBankFilterRequest;
import com.emenu.features.master.dto.request.PlatformBankRequest;
import com.emenu.features.master.dto.response.PlatformBankResponse;
import com.emenu.features.master.service.PlatformBankService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/platform-banks")
@RequiredArgsConstructor
public class AdminPlatformBankController {

    private final PlatformBankService platformBankService;

    @PostMapping
    public ResponseEntity<ApiResponse<PlatformBankResponse>> createPlatformBank(
            @Valid @RequestBody PlatformBankRequest request) {
        PlatformBankResponse response = platformBankService.createPlatformBank(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Platform bank created successfully", response));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<PlatformBankResponse>>> getAllPlatformBanks(
            @Valid @RequestBody PlatformBankFilterRequest filter) {
        PaginationResponse<PlatformBankResponse> response = platformBankService.getAllPlatformBanksWithFilters(filter);
        return ResponseEntity.ok(ApiResponse.success("Platform banks retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PlatformBankResponse>> getPlatformBankById(
            @PathVariable UUID id) {
        PlatformBankResponse response = platformBankService.getPlatformBankById(id);
        return ResponseEntity.ok(ApiResponse.success("Platform bank retrieved successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PlatformBankResponse>> updatePlatformBank(
            @PathVariable UUID id,
            @Valid @RequestBody PlatformBankRequest request) {
        PlatformBankResponse response = platformBankService.updatePlatformBank(id, request);
        return ResponseEntity.ok(ApiResponse.success("Platform bank updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePlatformBank(
            @PathVariable UUID id) {
        platformBankService.deletePlatformBank(id);
        return ResponseEntity.ok(ApiResponse.success("Platform bank deleted successfully", null));
    }
}
