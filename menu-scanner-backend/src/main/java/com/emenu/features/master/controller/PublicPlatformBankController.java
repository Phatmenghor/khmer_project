package com.emenu.features.master.controller;

import com.emenu.features.master.dto.response.PlatformBankResponse;
import com.emenu.features.master.service.PlatformBankService;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/platform-banks")
@RequiredArgsConstructor
public class PublicPlatformBankController {

    private final PlatformBankService platformBankService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PlatformBankResponse>>> getPublicActivePlatformBanks() {
        List<PlatformBankResponse> response = platformBankService.getPublicActivePlatformBanks();
        return ResponseEntity.ok(ApiResponse.success("Platform active bank accounts retrieved successfully", response));
    }
}
