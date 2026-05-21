package com.emenu.features.portfolio.service.impl;

import com.emenu.exception.custom.ResourceNotFoundException;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.portfolio.dto.filter.PortfolioReviewFilterRequest;
import com.emenu.features.portfolio.dto.request.PortfolioProfileSaveRequest;
import com.emenu.features.portfolio.dto.request.PortfolioReviewSubmitRequest;
import com.emenu.features.portfolio.dto.response.PortfolioAdminResponse;
import com.emenu.features.portfolio.dto.response.PortfolioPublicResponse;
import com.emenu.features.portfolio.dto.response.PortfolioReviewAdminResponse;
import com.emenu.features.portfolio.dto.response.ReviewStatsResponse;
import com.emenu.features.portfolio.mapper.PortfolioMapper;
import com.emenu.features.portfolio.models.*;
import com.emenu.features.portfolio.repository.PortfolioProfileRepository;
import com.emenu.features.portfolio.repository.PortfolioReviewRepository;
import com.emenu.features.portfolio.service.PortfolioService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PortfolioServiceImpl implements PortfolioService {

    private final PortfolioProfileRepository profileRepository;
    private final PortfolioReviewRepository reviewRepository;
    private final BusinessRepository businessRepository;
    private final SecurityUtils securityUtils;
    private final PortfolioMapper portfolioMapper;
    private final PaginationMapper paginationMapper;

    @Override
    @Transactional(readOnly = true)
    public PortfolioAdminResponse getMyProfile() {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        PortfolioProfile profile = profileRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio profile not found for this business"));
        PortfolioAdminResponse response = portfolioMapper.toAdminResponse(profile);
        response.setReviewStats(computeReviewStats(profile.getId()));
        return response;
    }

    @Override
    public PortfolioAdminResponse saveProfile(PortfolioProfileSaveRequest request) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();

        if (profileRepository.existsBySlugAndBusinessIdNotAndIsDeletedFalse(request.getSlug(), businessId)) {
            throw new ValidationException("Slug '" + request.getSlug() + "' is already taken by another business");
        }

        String businessName = businessRepository.findByIdAndIsDeletedFalse(businessId)
                .map(Business::getName)
                .orElse(null);

        PortfolioProfile profile = profileRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElseGet(PortfolioProfile::new);

        applyProfileFields(profile, request, businessId, businessName);

        PortfolioProfile savedProfile = profileRepository.save(profile);
        rebuildCollections(savedProfile, request);

        PortfolioProfile finalProfile = profileRepository.save(savedProfile);
        log.info("Portfolio profile saved for businessId={}", businessId);

        PortfolioAdminResponse response = portfolioMapper.toAdminResponse(finalProfile);
        response.setReviewStats(computeReviewStats(finalProfile.getId()));
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PortfolioPublicResponse getPublicProfile(UUID businessId) {
        PortfolioProfile profile = profileRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio profile not found for business: " + businessId));
        PortfolioPublicResponse response = portfolioMapper.toPublicResponse(profile);
        response.setReviewStats(computeReviewStats(profile.getId()));
        return response;
    }

    @Override
    public void submitReview(UUID businessId, PortfolioReviewSubmitRequest request) {
        PortfolioProfile profile = profileRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio profile not found for business: " + businessId));

        PortfolioReview review = portfolioMapper.toReviewEntity(request);
        review.setProfileId(profile.getId());
        review.setBusinessId(businessId);

        reviewRepository.save(review);
        log.info("Review submitted for businessId={}", businessId);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<PortfolioReviewAdminResponse> getReviews(PortfolioReviewFilterRequest filter) {
        UUID businessId = filter.getBusinessId();
        PortfolioProfile profile = profileRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio profile not found for this business"));

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        String search = (filter.getSearch() != null && !filter.getSearch().isBlank()) ? filter.getSearch() : null;

        Page<PortfolioReview> page = reviewRepository.findWithFilters(profile.getId(), search, pageable);

        return portfolioMapper.toReviewPaginationResponse(page, paginationMapper);
    }

    @Override
    public void deleteReview(UUID reviewId) {
        PortfolioReview review = reviewRepository.findById(reviewId)
                .filter(r -> !Boolean.TRUE.equals(r.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + reviewId));
        review.softDelete();
        reviewRepository.save(review);
        log.info("Review soft-deleted: id={}", reviewId);
    }

    // ==================== Private Helpers ====================

    private void applyProfileFields(PortfolioProfile profile, PortfolioProfileSaveRequest request,
                                    UUID businessId, String businessName) {
        portfolioMapper.applyProfileFields(profile, request);
        profile.setBusinessId(businessId);
        profile.setBusinessName(businessName);
    }

    private void rebuildCollections(PortfolioProfile savedProfile, PortfolioProfileSaveRequest request) {
        savedProfile.getBusinessHours().clear();
        if (request.getBusinessHours() != null) {
            request.getBusinessHours().forEach(req -> {
                PortfolioHours hours = portfolioMapper.toHoursEntity(req);
                hours.setProfile(savedProfile);
                savedProfile.getBusinessHours().add(hours);
            });
        }

        savedProfile.getGallery().clear();
        if (request.getGallery() != null) {
            request.getGallery().forEach(req -> {
                PortfolioGalleryItem item = portfolioMapper.toGalleryEntity(req);
                item.setProfile(savedProfile);
                savedProfile.getGallery().add(item);
            });
        }

        savedProfile.getServices().clear();
        if (request.getServices() != null) {
            request.getServices().forEach(req -> {
                PortfolioServiceItem svc = portfolioMapper.toServiceEntity(req);
                svc.setProfile(savedProfile);
                savedProfile.getServices().add(svc);
            });
        }

        savedProfile.getTeam().clear();
        if (request.getTeam() != null) {
            request.getTeam().forEach(req -> {
                PortfolioTeamMember member = portfolioMapper.toTeamEntity(req);
                member.setProfile(savedProfile);
                savedProfile.getTeam().add(member);
            });
        }

        savedProfile.getCustomStats().clear();
        if (request.getCustomStats() != null) {
            request.getCustomStats().forEach(req -> {
                PortfolioCustomStat stat = portfolioMapper.toCustomStatEntity(req);
                stat.setProfile(savedProfile);
                savedProfile.getCustomStats().add(stat);
            });
        }
    }

    private ReviewStatsResponse computeReviewStats(UUID profileId) {
        List<Object[]> ratingCounts = reviewRepository.countByRatingForProfile(profileId);
        Map<Integer, Long> distribution = new HashMap<>(Map.of(1, 0L, 2, 0L, 3, 0L, 4, 0L, 5, 0L));
        long total = 0;
        double sum = 0;
        for (Object[] row : ratingCounts) {
            int rating = ((Number) row[0]).intValue();
            long count = ((Number) row[1]).longValue();
            distribution.put(rating, count);
            total += count;
            sum += (double) rating * count;
        }
        double avg = total > 0 ? sum / total : 0.0;
        return ReviewStatsResponse.builder()
                .averageRating(avg)
                .totalReviews(total)
                .distribution(distribution)
                .build();
    }
}
