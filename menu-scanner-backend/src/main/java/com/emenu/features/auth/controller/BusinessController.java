package com.emenu.features.auth.controller;

import com.emenu.features.auth.dto.filter.BusinessFilterRequest;
import com.emenu.features.auth.dto.response.BusinessResponse;
import com.emenu.features.auth.service.BusinessService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/businesses")
@RequiredArgsConstructor
@Slf4j
public class BusinessController {

    private final BusinessService businessService;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BusinessResponse>>> getAllBusinesses(
            @RequestBody BusinessFilterRequest filterRequest) {
        log.info("Endpoint: businesses/all - search: {}", filterRequest.getSearch());
        PaginationResponse<BusinessResponse> response = businessService.getAllBusinesses(filterRequest);
        return ResponseEntity.ok(ApiResponse.success("Businesses retrieved successfully", response));
    }
}
