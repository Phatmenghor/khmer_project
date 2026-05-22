package com.emenu.features.portfolio.service.impl;

import com.emenu.exception.custom.ResourceNotFoundException;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.portfolio.dto.filter.PortfolioReviewFilterRequest;
import com.emenu.features.portfolio.dto.request.PortfolioProfileSaveRequest;
import com.emenu.features.portfolio.dto.request.PortfolioReviewSubmitRequest;
import com.emenu.features.portfolio.dto.response.PortfolioResponse;
import com.emenu.features.portfolio.dto.response.PortfolioReviewAdminResponse;
import com.emenu.features.portfolio.dto.response.PortfolioReviewPublicResponse;
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
    public PortfolioResponse getMyProfile() {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        PortfolioProfile profile = profileRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio profile not found for this business"));
        PortfolioResponse response = portfolioMapper.toResponse(profile);
        response.setReviewStats(computeReviewStats(profile.getId()));
        return response;
    }

    @Override
    public PortfolioResponse saveProfile(PortfolioProfileSaveRequest request) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();

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

        PortfolioResponse response = portfolioMapper.toResponse(finalProfile);
        response.setReviewStats(computeReviewStats(finalProfile.getId()));
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PortfolioResponse getPublicProfile(UUID businessId) {
        PortfolioProfile profile = profileRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio profile not found for business: " + businessId));
        PortfolioResponse response = portfolioMapper.toResponse(profile);
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
        UUID businessId = securityUtils.getCurrentUserBusinessId();

        Pageable pageable = PaginationUtils.createPageableForNativeQuery(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        String search = (filter.getSearch() != null && !filter.getSearch().isBlank()) ? filter.getSearch() : null;

        Page<PortfolioReview> page = reviewRepository.findWithFiltersByBusiness(businessId, search, pageable);

        return portfolioMapper.toReviewPaginationResponse(page, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public PortfolioReviewAdminResponse getReviewDetail(UUID reviewId) {
        PortfolioReview review = reviewRepository.findById(reviewId)
                .filter(r -> !Boolean.TRUE.equals(r.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + reviewId));
        return portfolioMapper.toReviewAdminResponse(review);
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

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<PortfolioReviewPublicResponse> getPublicReviews(UUID businessId, PortfolioReviewFilterRequest filter) {
        Pageable pageable = PaginationUtils.createPageableForNativeQuery(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        String search = (filter.getSearch() != null && !filter.getSearch().isBlank()) ? filter.getSearch() : null;

        Page<PortfolioReview> page = reviewRepository.findWithFiltersByBusiness(businessId, search, pageable);

        return portfolioMapper.toReviewPublicPaginationResponse(page, paginationMapper);
    }

    // ==================== Private Helpers ====================

    private void applyProfileFields(PortfolioProfile profile, PortfolioProfileSaveRequest request,
                                    UUID businessId, String businessName) {
        portfolioMapper.applyProfileFields(profile, request);
        profile.setBusinessId(businessId);
        profile.setBusinessName(businessName);
    }

    private void rebuildCollections(PortfolioProfile savedProfile, PortfolioProfileSaveRequest request) {
        savedProfile.getContactPhones().clear();
        if (request.getContact() != null && request.getContact().getPhones() != null) {
            for (int i = 0; i < request.getContact().getPhones().size(); i++) {
                PortfolioPhone phone = portfolioMapper.toPhoneEntity(request.getContact().getPhones().get(i));
                phone.setProfile(savedProfile);
                savedProfile.getContactPhones().add(phone);
            }
        }

        savedProfile.getFeatures().clear();
        if (request.getFeatures() != null) {
            for (int i = 0; i < request.getFeatures().size(); i++) {
                PortfolioFeature feature = portfolioMapper.toFeatureEntity(request.getFeatures().get(i));
                feature.setProfile(savedProfile);
                savedProfile.getFeatures().add(feature);
            }
        }

        savedProfile.getSocialMedia().clear();
        if (request.getSocialMedia() != null) {
            for (int i = 0; i < request.getSocialMedia().size(); i++) {
                PortfolioSocialMedia socialMedia = portfolioMapper.toSocialMediaEntity(request.getSocialMedia().get(i));
                socialMedia.setProfile(savedProfile);
                savedProfile.getSocialMedia().add(socialMedia);
            }
        }

        savedProfile.getBusinessHours().clear();
        if (request.getBusinessHours() != null) {
            for (int i = 0; i < request.getBusinessHours().size(); i++) {
                PortfolioHours hours = portfolioMapper.toHoursEntity(request.getBusinessHours().get(i));
                hours.setProfile(savedProfile);
                savedProfile.getBusinessHours().add(hours);
            }
        }

        savedProfile.getGallery().clear();
        if (request.getGallery() != null) {
            for (int i = 0; i < request.getGallery().size(); i++) {
                PortfolioGalleryItem item = portfolioMapper.toGalleryEntity(request.getGallery().get(i));
                item.setProfile(savedProfile);
                savedProfile.getGallery().add(item);
            }
        }

        savedProfile.getServices().clear();
        if (request.getServices() != null) {
            for (int i = 0; i < request.getServices().size(); i++) {
                PortfolioServiceItem svc = portfolioMapper.toServiceEntity(request.getServices().get(i));
                svc.setProfile(savedProfile);
                savedProfile.getServices().add(svc);
            }
        }

        savedProfile.getTeam().clear();
        if (request.getTeam() != null) {
            for (int i = 0; i < request.getTeam().size(); i++) {
                PortfolioTeamMember member = portfolioMapper.toTeamEntity(request.getTeam().get(i));
                member.setProfile(savedProfile);
                savedProfile.getTeam().add(member);
            }
        }

        savedProfile.getCustomStats().clear();
        if (request.getCustomStats() != null) {
            for (int i = 0; i < request.getCustomStats().size(); i++) {
                PortfolioCustomStat stat = portfolioMapper.toCustomStatEntity(request.getCustomStats().get(i));
                stat.setProfile(savedProfile);
                savedProfile.getCustomStats().add(stat);
            }
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
        double roundedAvg = Math.round(avg * 100.0) / 100.0;
        return ReviewStatsResponse.builder()
                .averageRating(roundedAvg)
                .totalReviews(total)
                .distribution(distribution)
                .build();
    }
}
