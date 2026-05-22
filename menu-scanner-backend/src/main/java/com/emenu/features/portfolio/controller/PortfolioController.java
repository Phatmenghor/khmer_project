package com.emenu.features.portfolio.controller;

import com.emenu.features.portfolio.dto.filter.PortfolioReviewFilterRequest;
import com.emenu.features.portfolio.dto.request.PortfolioProfileSaveRequest;
import com.emenu.features.portfolio.dto.response.PortfolioResponse;
import com.emenu.features.portfolio.dto.response.PortfolioReviewAdminResponse;
import com.emenu.features.portfolio.service.PortfolioService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/portfolio")
@RequiredArgsConstructor
@Slf4j
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final SecurityUtils securityUtils;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<PortfolioResponse>> getMyProfile() {
        return ResponseEntity.ok(ApiResponse.success("Portfolio profile found",
                portfolioService.getMyProfile()));
    }

    @PostMapping("/profile")
    public ResponseEntity<ApiResponse<PortfolioResponse>> saveProfile(
            @Valid @RequestBody PortfolioProfileSaveRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Portfolio profile saved",
                portfolioService.saveProfile(request)));
    }

    @PostMapping("/reviews/all")
    public ResponseEntity<ApiResponse<PaginationResponse<PortfolioReviewAdminResponse>>> getReviews(
            @Valid @RequestBody PortfolioReviewFilterRequest filter) {
        return ResponseEntity.ok(ApiResponse.success("Reviews found",
                portfolioService.getReviews(filter)));
    }

    @GetMapping("/reviews/{id}")
    public ResponseEntity<ApiResponse<PortfolioReviewAdminResponse>> getReviewDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Review found",
                portfolioService.getReviewDetail(id)));
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable UUID id) {
        portfolioService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
    }
}
