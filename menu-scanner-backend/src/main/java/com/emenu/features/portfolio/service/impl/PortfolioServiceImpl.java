package com.emenu.features.portfolio.service.impl;

import com.emenu.exception.custom.ResourceNotFoundException;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.auth.repository.BusinessSettingRepository;
import com.emenu.features.portfolio.dto.filter.PortfolioReviewFilterRequest;
import com.emenu.features.portfolio.dto.request.*;
import com.emenu.features.portfolio.dto.response.*;
import com.emenu.features.portfolio.mapper.PortfolioMapper;
import com.emenu.features.portfolio.models.*;
import com.emenu.features.portfolio.repository.PortfolioProfileRepository;
import com.emenu.features.portfolio.repository.PortfolioReviewRepository;
import com.emenu.features.portfolio.service.PortfolioService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.domain.BaseUUIDEntity;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.BiConsumer;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PortfolioServiceImpl implements PortfolioService {

    private final PortfolioProfileRepository profileRepository;
    private final PortfolioReviewRepository reviewRepository;
    private final BusinessRepository businessRepository;
    private final BusinessSettingRepository businessSettingRepository;
    private final SecurityUtils securityUtils;
    private final PortfolioMapper portfolioMapper;
    private final PaginationMapper paginationMapper;

    @Override
    @Transactional(readOnly = true)
    public PortfolioResponse getMyProfile() {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        PortfolioProfile profile = profileRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElseGet(() -> {
                    log.info("No portfolio profile found for businessId={}, returning empty default profile", businessId);
                    PortfolioProfile defaultProfile = new PortfolioProfile();
                    defaultProfile.setBusinessId(businessId);
                    return defaultProfile;
                });
        PortfolioResponse response = portfolioMapper.toResponse(profile);
        enrichBusinessInfo(response, businessId);
        if (profile.getId() != null) {
            response.setReviewStats(computeReviewStats(profile.getId()));
        }
        return response;
    }

    @Override
    public PortfolioResponse saveProfile(PortfolioProfileSaveRequest request) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();

        PortfolioProfile profile = profileRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElseGet(() -> {
                    PortfolioProfile newProfile = new PortfolioProfile();
                    newProfile.setBusinessId(businessId);
                    return profileRepository.saveAndFlush(newProfile);
                });

        applyProfileFields(profile, request, businessId);
        PortfolioProfile savedProfile = profileRepository.saveAndFlush(profile);

        rebuildCollections(savedProfile, request);

        PortfolioProfile finalProfile = profileRepository.saveAndFlush(savedProfile);
        log.info("Portfolio profile successfully saved for businessId={}", businessId);

        PortfolioResponse response = portfolioMapper.toResponse(finalProfile);
        enrichBusinessInfo(response, businessId);
        response.setReviewStats(computeReviewStats(finalProfile.getId()));
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PortfolioResponse getPublicProfile(UUID businessId) {
        PortfolioProfile profile = profileRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElseGet(() -> {
                    PortfolioProfile defaultProfile = new PortfolioProfile();
                    defaultProfile.setBusinessId(businessId);
                    return defaultProfile;
                });
        PortfolioResponse response = portfolioMapper.toResponse(profile);
        enrichBusinessInfo(response, businessId);
        if (profile.getId() != null) {
            response.setReviewStats(computeReviewStats(profile.getId()));
        }
        return response;
    }

    @Override
    public void submitReview(UUID businessId, PortfolioReviewSubmitRequest request) {
        PortfolioProfile profile = profileRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElseGet(() -> {
                    PortfolioProfile defaultProfile = new PortfolioProfile();
                    defaultProfile.setBusinessId(businessId);
                    return profileRepository.save(defaultProfile);
                });

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
                                    UUID businessId) {
        portfolioMapper.applyProfileFields(profile, request);
        profile.setBusinessId(businessId);
    }

    private void rebuildCollections(PortfolioProfile profile, PortfolioProfileSaveRequest request) {
        UUID profileId = profile.getId();

        // 1. Sync Phones
        List<PortfolioPhoneRequest> phoneReqs = (request.getContact() != null) ? request.getContact().getPhones() : null;
        syncCollection(
                profile.getContactPhones(),
                phoneReqs,
                req -> parseUuid(req.getId()),
                portfolioMapper::updatePhoneEntity,
                portfolioMapper::toPhoneEntity,
                PortfolioPhone::setProfileId,
                profileId
        );

        // 2. Sync Features
        syncCollection(
                profile.getFeatures(),
                request.getFeatures(),
                req -> parseUuid(req.getId()),
                portfolioMapper::updateFeatureEntity,
                portfolioMapper::toFeatureEntity,
                PortfolioFeature::setProfileId,
                profileId
        );

        // 3. Sync Social Media
        syncCollection(
                profile.getSocialMedia(),
                request.getSocialMedia(),
                req -> parseUuid(req.getId()),
                portfolioMapper::updateSocialMediaEntity,
                portfolioMapper::toSocialMediaEntity,
                PortfolioSocialMedia::setProfileId,
                profileId
        );

        // 4. Sync Business Hours
        syncCollection(
                profile.getBusinessHours(),
                request.getBusinessHours(),
                req -> parseUuid(req.getId()),
                portfolioMapper::updateHoursEntity,
                portfolioMapper::toHoursEntity,
                PortfolioHours::setProfileId,
                profileId
        );

        // 5. Sync Gallery
        syncCollection(
                profile.getGallery(),
                request.getGallery(),
                req -> parseUuid(req.getId()),
                portfolioMapper::updateGalleryEntity,
                portfolioMapper::toGalleryEntity,
                PortfolioGalleryItem::setProfileId,
                profileId
        );

        // 6. Sync Services
        syncCollection(
                profile.getServices(),
                request.getServices(),
                req -> parseUuid(req.getId()),
                portfolioMapper::updateServiceEntity,
                portfolioMapper::toServiceEntity,
                PortfolioServiceItem::setProfileId,
                profileId
        );

        // 7. Sync Team Members
        syncCollection(
                profile.getTeam(),
                request.getTeam(),
                req -> parseUuid(req.getId()),
                portfolioMapper::updateTeamEntity,
                portfolioMapper::toTeamEntity,
                PortfolioTeamMember::setProfileId,
                profileId
        );

        // 8. Sync Custom Stats
        syncCollection(
                profile.getCustomStats(),
                request.getCustomStats(),
                req -> parseUuid(req.getId()),
                portfolioMapper::updateCustomStatEntity,
                portfolioMapper::toCustomStatEntity,
                PortfolioCustomStat::setProfileId,
                profileId
        );
    }

    private <E extends BaseUUIDEntity, R> void syncCollection(
            List<E> existingList,
            List<R> requestList,
            Function<R, UUID> idExtractor,
            BiConsumer<R, E> updateConsumer,
            Function<R, E> createFunction,
            BiConsumer<E, UUID> profileIdSetter,
            UUID profileId
    ) {
        if (requestList == null) {
            existingList.clear();
            return;
        }

        Map<UUID, E> existingMap = existingList.stream()
                .filter(item -> item.getId() != null)
                .collect(Collectors.toMap(BaseUUIDEntity::getId, Function.identity(), (a, b) -> a));

        Set<UUID> incomingIds = new HashSet<>();
        List<E> toAdd = new ArrayList<>();

        for (R req : requestList) {
            UUID reqId = idExtractor.apply(req);
            if (reqId != null && existingMap.containsKey(reqId)) {
                incomingIds.add(reqId);
                E existingItem = existingMap.get(reqId);
                updateConsumer.accept(req, existingItem);
                profileIdSetter.accept(existingItem, profileId);
                log.debug("Updated existing entity in-place for class={}, id={}", existingItem.getClass().getSimpleName(), reqId);
            } else {
                E newItem = createFunction.apply(req);
                profileIdSetter.accept(newItem, profileId);
                toAdd.add(newItem);
                log.debug("Created new entity for class={}, profileId={}", newItem.getClass().getSimpleName(), profileId);
            }
        }

        existingList.removeIf(item -> item.getId() != null && !incomingIds.contains(item.getId()));
        existingList.addAll(toAdd);
    }

    private UUID parseUuid(Object rawId) {
        if (rawId == null) return null;
        if (rawId instanceof UUID uuid) return uuid;
        String str = rawId.toString().trim();
        if (str.isEmpty()) return null;
        try {
            return UUID.fromString(str);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private void enrichBusinessInfo(PortfolioResponse response, UUID businessId) {
        if (businessId == null) return;
        businessRepository.findByIdAndIsDeletedFalse(businessId)
                .ifPresent(b -> response.setBusinessName(b.getName()));
        businessSettingRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .ifPresent(s -> response.setLogo(s.getLogoBusiness()));
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

        double average = total > 0 ? Math.round((sum / total) * 10.0) / 10.0 : 0.0;
        return ReviewStatsResponse.builder()
                .averageRating(average)
                .totalReviews(total)
                .distribution(distribution)
                .build();
    }
}
