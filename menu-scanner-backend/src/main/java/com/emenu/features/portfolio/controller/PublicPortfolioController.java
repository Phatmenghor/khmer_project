package com.emenu.features.portfolio.controller;

import com.emenu.features.portfolio.dto.filter.PortfolioReviewFilterRequest;
import com.emenu.features.portfolio.dto.request.PortfolioReviewSubmitRequest;
import com.emenu.features.portfolio.dto.response.PortfolioResponse;
import com.emenu.features.portfolio.dto.response.PortfolioReviewPublicResponse;
import com.emenu.features.portfolio.service.PortfolioService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/portfolio")
@RequiredArgsConstructor
@Slf4j
public class PublicPortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping("/{businessId}")
    public ResponseEntity<ApiResponse<PortfolioResponse>> getPublicProfile(@PathVariable UUID businessId) {
        return ResponseEntity.ok(ApiResponse.success("Portfolio profile found",
                portfolioService.getPublicProfile(businessId)));
    }

    @PostMapping("/{businessId}/reviews")
    public ResponseEntity<ApiResponse<Void>> submitReview(
            @PathVariable UUID businessId,
            @Valid @RequestBody PortfolioReviewSubmitRequest request) {
        portfolioService.submitReview(businessId, request);
        return ResponseEntity.ok(ApiResponse.success("Review submitted successfully, pending approval", null));
    }

    @GetMapping("/{businessId}/reviews")
    public ResponseEntity<ApiResponse<PaginationResponse<PortfolioReviewPublicResponse>>> getReviews(
            @PathVariable UUID businessId,
            @Valid PortfolioReviewFilterRequest filter) {
        return ResponseEntity.ok(ApiResponse.success("Reviews found",
                portfolioService.getPublicReviews(businessId, filter)));
    }
}
