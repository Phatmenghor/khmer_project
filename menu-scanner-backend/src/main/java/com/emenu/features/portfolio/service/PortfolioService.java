package com.emenu.features.portfolio.service;

import com.emenu.features.portfolio.dto.filter.PortfolioReviewFilterRequest;
import com.emenu.features.portfolio.dto.request.PortfolioProfileSaveRequest;
import com.emenu.features.portfolio.dto.request.PortfolioReviewSubmitRequest;
import com.emenu.features.portfolio.dto.response.PortfolioResponse;
import com.emenu.features.portfolio.dto.response.PortfolioReviewAdminResponse;
import com.emenu.shared.dto.PaginationResponse;

import java.util.UUID;

public interface PortfolioService {

    PortfolioResponse getMyProfile();

    PortfolioResponse saveProfile(PortfolioProfileSaveRequest request);

    PortfolioResponse getPublicProfile(UUID businessId);

    void submitReview(UUID businessId, PortfolioReviewSubmitRequest request);

    PaginationResponse<PortfolioReviewAdminResponse> getReviews(PortfolioReviewFilterRequest filter);

    void deleteReview(UUID reviewId);
}
