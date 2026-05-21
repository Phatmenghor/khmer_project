package com.emenu.features.portfolio.service;

import com.emenu.features.portfolio.dto.filter.PortfolioReviewFilterRequest;
import com.emenu.features.portfolio.dto.request.PortfolioProfileSaveRequest;
import com.emenu.features.portfolio.dto.request.PortfolioReviewSubmitRequest;
import com.emenu.features.portfolio.dto.response.PortfolioAdminResponse;
import com.emenu.features.portfolio.dto.response.PortfolioPublicResponse;
import com.emenu.features.portfolio.dto.response.PortfolioReviewAdminResponse;
import com.emenu.shared.dto.PaginationResponse;

import java.util.UUID;

public interface PortfolioService {

    PortfolioAdminResponse getMyProfile();

    PortfolioAdminResponse saveProfile(PortfolioProfileSaveRequest request);

    PortfolioPublicResponse getPublicProfile(UUID businessId);

    void submitReview(UUID businessId, PortfolioReviewSubmitRequest request);

    PaginationResponse<PortfolioReviewAdminResponse> getReviews(PortfolioReviewFilterRequest filter);

    PortfolioReviewAdminResponse approveReview(UUID reviewId);

    PortfolioReviewAdminResponse rejectReview(UUID reviewId);

    void deleteReview(UUID reviewId);
}
