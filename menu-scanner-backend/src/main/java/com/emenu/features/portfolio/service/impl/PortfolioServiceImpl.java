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
import com.emenu.features.portfolio.models.*;
import com.emenu.features.portfolio.repository.PortfolioProfileRepository;
import com.emenu.features.portfolio.repository.PortfolioReviewRepository;
import com.emenu.features.portfolio.service.PortfolioService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PortfolioServiceImpl implements PortfolioService {

    private final PortfolioProfileRepository profileRepository;
    private final PortfolioReviewRepository reviewRepository;
    private final BusinessRepository businessRepository;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional(readOnly = true)
    public PortfolioAdminResponse getMyProfile() {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        PortfolioProfile profile = profileRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio profile not found for this business"));
        ReviewStatsResponse reviewStats = computeReviewStats(profile.getId());
        return toAdminResponse(profile, reviewStats);
    }

    @Override
    public PortfolioAdminResponse saveProfile(PortfolioProfileSaveRequest request) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();

        // Validate slug uniqueness
        if (profileRepository.existsBySlugAndBusinessIdNotAndIsDeletedFalse(request.getSlug(), businessId)) {
            throw new ValidationException("Slug '" + request.getSlug() + "' is already taken by another business");
        }

        // Fetch business name
        String businessName = businessRepository.findByIdAndIsDeletedFalse(businessId)
                .map(Business::getName)
                .orElse(null);

        // Upsert profile
        PortfolioProfile profile = profileRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElseGet(PortfolioProfile::new);

        profile.setBusinessId(businessId);
        profile.setBusinessName(businessName);
        profile.setSlug(request.getSlug());
        profile.setTagline(request.getTagline());
        profile.setDescription(request.getDescription());
        profile.setLogoUrl(request.getLogoUrl());
        profile.setCoverImageUrl(request.getCoverImageUrl());
        profile.setIndustry(request.getIndustry());
        profile.setContactEmail(request.getContactEmail());
        profile.setContactPhone(request.getContactPhone());
        profile.setContactPhones(request.getContactPhones() != null ? new ArrayList<>(request.getContactPhones()) : new ArrayList<>());
        profile.setContactWhatsapp(request.getContactWhatsapp());
        profile.setContactTelegram(request.getContactTelegram());
        profile.setAddressStreet(request.getAddressStreet());
        profile.setAddressCity(request.getAddressCity());
        profile.setAddressState(request.getAddressState());
        profile.setAddressCountry(request.getAddressCountry());
        profile.setAddressPostalCode(request.getAddressPostalCode());
        profile.setMapLink(request.getMapLink());
        profile.setSocialFacebook(request.getSocialFacebook());
        profile.setSocialInstagram(request.getSocialInstagram());
        profile.setSocialTwitter(request.getSocialTwitter());
        profile.setSocialLinkedin(request.getSocialLinkedin());
        profile.setSocialYoutube(request.getSocialYoutube());
        profile.setSocialTiktok(request.getSocialTiktok());
        profile.setSocialWebsite(request.getSocialWebsite());
        profile.setFeatures(request.getFeatures() != null ? new ArrayList<>(request.getFeatures()) : new ArrayList<>());
        profile.setYearsInBusiness(request.getYearsInBusiness());
        profile.setCustomersServed(request.getCustomersServed());
        profile.setIsPublished(request.getIsPublished() != null ? request.getIsPublished() : false);

        // Save to get id for child collection assignment
        PortfolioProfile savedProfile = profileRepository.save(profile);

        // Rebuild business hours
        savedProfile.getBusinessHours().clear();
        if (request.getBusinessHours() != null) {
            for (var req : request.getBusinessHours()) {
                PortfolioHours hours = new PortfolioHours();
                hours.setProfile(savedProfile);
                hours.setDay(req.getDay());
                hours.setIsOpen(req.getIsOpen());
                hours.setOpenTime(req.getOpenTime());
                hours.setCloseTime(req.getCloseTime());
                hours.setIs24Hours(req.getIs24Hours() != null ? req.getIs24Hours() : false);
                hours.setDisplayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0);
                savedProfile.getBusinessHours().add(hours);
            }
        }

        // Rebuild gallery
        savedProfile.getGallery().clear();
        if (request.getGallery() != null) {
            for (var req : request.getGallery()) {
                PortfolioGalleryItem item = new PortfolioGalleryItem();
                item.setProfile(savedProfile);
                item.setUrl(req.getUrl());
                item.setTitle(req.getTitle());
                item.setDescription(req.getDescription());
                item.setDisplayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0);
                savedProfile.getGallery().add(item);
            }
        }

        // Rebuild services
        savedProfile.getServices().clear();
        if (request.getServices() != null) {
            for (var req : request.getServices()) {
                PortfolioServiceItem svc = new PortfolioServiceItem();
                svc.setProfile(savedProfile);
                svc.setName(req.getName());
                svc.setDescription(req.getDescription());
                svc.setDisplayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0);
                savedProfile.getServices().add(svc);
            }
        }

        // Rebuild team
        savedProfile.getTeam().clear();
        if (request.getTeam() != null) {
            for (var req : request.getTeam()) {
                PortfolioTeamMember member = new PortfolioTeamMember();
                member.setProfile(savedProfile);
                member.setName(req.getName());
                member.setPosition(req.getPosition());
                member.setBio(req.getBio());
                member.setPhotoUrl(req.getPhotoUrl());
                member.setDisplayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0);
                savedProfile.getTeam().add(member);
            }
        }

        // Rebuild custom stats
        savedProfile.getCustomStats().clear();
        if (request.getCustomStats() != null) {
            for (var req : request.getCustomStats()) {
                PortfolioCustomStat stat = new PortfolioCustomStat();
                stat.setProfile(savedProfile);
                stat.setLabel(req.getLabel());
                stat.setValue(req.getValue());
                stat.setDisplayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0);
                savedProfile.getCustomStats().add(stat);
            }
        }

        PortfolioProfile finalProfile = profileRepository.save(savedProfile);
        log.info("Portfolio profile saved for businessId={}", businessId);

        ReviewStatsResponse reviewStats = computeReviewStats(finalProfile.getId());
        return toAdminResponse(finalProfile, reviewStats);
    }

    @Override
    @Transactional(readOnly = true)
    public PortfolioPublicResponse getPublicProfile(UUID businessId) {
        PortfolioProfile profile = profileRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio profile not found for business: " + businessId));

        ReviewStatsResponse reviewStats = computeReviewStats(profile.getId());
        return toPublicResponse(profile, reviewStats);
    }

    @Override
    public void submitReview(UUID businessId, PortfolioReviewSubmitRequest request) {
        PortfolioProfile profile = profileRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio profile not found for business: " + businessId));

        PortfolioReview review = new PortfolioReview();
        review.setProfileId(profile.getId());
        review.setBusinessId(businessId);
        review.setCustomerName(request.getCustomerName());
        review.setCustomerEmail(request.getCustomerEmail());
        review.setCustomerPhone(request.getCustomerPhone());
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setComment(request.getComment());
        review.setIsApproved(false);
        review.setWouldRecommend(request.getWouldRecommend());

        reviewRepository.save(review);
        log.info("Review submitted for businessId={}, pending approval", businessId);
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

        Page<PortfolioReview> page = reviewRepository.findWithFilters(
                profile.getId(),
                search,
                filter.getIsApproved(),
                pageable
        );

        List<PortfolioReviewAdminResponse> content = page.getContent().stream()
                .map(this::toReviewAdminResponse)
                .collect(Collectors.toList());

        PaginationResponse<PortfolioReviewAdminResponse> response = new PaginationResponse<>();
        response.setContent(content);
        response.setPageNo(page.getNumber() + 1);
        response.setPageSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setFirst(page.isFirst());
        response.setLast(page.isLast());
        response.setHasNext(page.hasNext());
        response.setHasPrevious(page.hasPrevious());

        return response;
    }

    @Override
    public PortfolioReviewAdminResponse approveReview(UUID reviewId) {
        PortfolioReview review = findReviewById(reviewId);
        review.setIsApproved(true);
        PortfolioReview saved = reviewRepository.save(review);
        log.info("Review approved: id={}", reviewId);
        return toReviewAdminResponse(saved);
    }

    @Override
    public PortfolioReviewAdminResponse rejectReview(UUID reviewId) {
        PortfolioReview review = findReviewById(reviewId);
        review.setIsApproved(false);
        PortfolioReview saved = reviewRepository.save(review);
        log.info("Review rejected: id={}", reviewId);
        return toReviewAdminResponse(saved);
    }

    @Override
    public void deleteReview(UUID reviewId) {
        PortfolioReview review = findReviewById(reviewId);
        review.softDelete();
        reviewRepository.save(review);
        log.info("Review soft-deleted: id={}", reviewId);
    }

    // ==================== Private Helpers ====================

    private PortfolioReview findReviewById(UUID reviewId) {
        return reviewRepository.findById(reviewId)
                .filter(r -> !Boolean.TRUE.equals(r.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + reviewId));
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

    private PortfolioAdminResponse toAdminResponse(PortfolioProfile profile, ReviewStatsResponse reviewStats) {
        return PortfolioAdminResponse.builder()
                .id(profile.getId())
                .slug(profile.getSlug())
                .businessName(profile.getBusinessName())
                .tagline(profile.getTagline())
                .description(profile.getDescription())
                .logoUrl(profile.getLogoUrl())
                .coverImageUrl(profile.getCoverImageUrl())
                .industry(profile.getIndustry())
                .isPublished(profile.getIsPublished())
                .contact(buildContactDto(profile))
                .socialMedia(buildSocialMediaDto(profile))
                .businessHours(buildHoursDtoList(profile.getBusinessHours()))
                .gallery(buildGalleryDtoList(profile.getGallery()))
                .services(buildServiceDtoList(profile.getServices()))
                .team(buildTeamDtoList(profile.getTeam()))
                .features(profile.getFeatures())
                .stats(buildStatsDto(profile))
                .reviewStats(reviewStats)
                .createdAt(profile.getCreatedAt() != null ? profile.getCreatedAt().toString() : null)
                .updatedAt(profile.getUpdatedAt() != null ? profile.getUpdatedAt().toString() : null)
                .build();
    }

    private PortfolioPublicResponse toPublicResponse(PortfolioProfile profile, ReviewStatsResponse reviewStats) {
        return PortfolioPublicResponse.builder()
                .id(profile.getId())
                .slug(profile.getSlug())
                .businessName(profile.getBusinessName())
                .tagline(profile.getTagline())
                .description(profile.getDescription())
                .logoUrl(profile.getLogoUrl())
                .coverImageUrl(profile.getCoverImageUrl())
                .industry(profile.getIndustry())
                .isPublished(profile.getIsPublished())
                .contact(buildContactDto(profile))
                .socialMedia(buildSocialMediaDto(profile))
                .businessHours(buildHoursDtoList(profile.getBusinessHours()))
                .gallery(buildGalleryDtoList(profile.getGallery()))
                .services(buildServiceDtoList(profile.getServices()))
                .team(buildTeamDtoList(profile.getTeam()))
                .features(profile.getFeatures())
                .stats(buildStatsDto(profile))
                .reviewStats(reviewStats)
                .createdAt(profile.getCreatedAt() != null ? profile.getCreatedAt().toString() : null)
                .updatedAt(profile.getUpdatedAt() != null ? profile.getUpdatedAt().toString() : null)
                .build();
    }

    private PortfolioPublicResponse.ContactDto buildContactDto(PortfolioProfile profile) {
        return PortfolioPublicResponse.ContactDto.builder()
                .email(profile.getContactEmail())
                .phone(profile.getContactPhone())
                .phones(profile.getContactPhones())
                .whatsapp(profile.getContactWhatsapp())
                .telegram(profile.getContactTelegram())
                .address(PortfolioPublicResponse.AddressDto.builder()
                        .street(profile.getAddressStreet())
                        .city(profile.getAddressCity())
                        .state(profile.getAddressState())
                        .country(profile.getAddressCountry())
                        .postalCode(profile.getAddressPostalCode())
                        .build())
                .mapLink(profile.getMapLink())
                .build();
    }

    private PortfolioPublicResponse.SocialMediaDto buildSocialMediaDto(PortfolioProfile profile) {
        return PortfolioPublicResponse.SocialMediaDto.builder()
                .facebook(profile.getSocialFacebook())
                .instagram(profile.getSocialInstagram())
                .twitter(profile.getSocialTwitter())
                .linkedin(profile.getSocialLinkedin())
                .youtube(profile.getSocialYoutube())
                .tiktok(profile.getSocialTiktok())
                .website(profile.getSocialWebsite())
                .build();
    }

    private List<PortfolioPublicResponse.HoursDto> buildHoursDtoList(List<PortfolioHours> hours) {
        if (hours == null) return Collections.emptyList();
        return hours.stream()
                .filter(h -> !Boolean.TRUE.equals(h.getIsDeleted()))
                .map(h -> PortfolioPublicResponse.HoursDto.builder()
                        .day(h.getDay())
                        .isOpen(h.getIsOpen())
                        .openTime(h.getOpenTime())
                        .closeTime(h.getCloseTime())
                        .is24Hours(h.getIs24Hours())
                        .build())
                .collect(Collectors.toList());
    }

    private List<PortfolioPublicResponse.GalleryItemDto> buildGalleryDtoList(List<PortfolioGalleryItem> gallery) {
        if (gallery == null) return Collections.emptyList();
        return gallery.stream()
                .filter(g -> !Boolean.TRUE.equals(g.getIsDeleted()))
                .map(g -> PortfolioPublicResponse.GalleryItemDto.builder()
                        .id(g.getId())
                        .url(g.getUrl())
                        .title(g.getTitle())
                        .description(g.getDescription())
                        .displayOrder(g.getDisplayOrder())
                        .build())
                .collect(Collectors.toList());
    }

    private List<PortfolioPublicResponse.ServiceItemDto> buildServiceDtoList(List<PortfolioServiceItem> services) {
        if (services == null) return Collections.emptyList();
        return services.stream()
                .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                .map(s -> PortfolioPublicResponse.ServiceItemDto.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .description(s.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    private List<PortfolioPublicResponse.TeamMemberDto> buildTeamDtoList(List<PortfolioTeamMember> team) {
        if (team == null) return Collections.emptyList();
        return team.stream()
                .filter(m -> !Boolean.TRUE.equals(m.getIsDeleted()))
                .map(m -> PortfolioPublicResponse.TeamMemberDto.builder()
                        .id(m.getId())
                        .name(m.getName())
                        .position(m.getPosition())
                        .bio(m.getBio())
                        .photoUrl(m.getPhotoUrl())
                        .build())
                .collect(Collectors.toList());
    }

    private PortfolioPublicResponse.StatsDto buildStatsDto(PortfolioProfile profile) {
        List<PortfolioPublicResponse.CustomStatDto> customStats = Collections.emptyList();
        if (profile.getCustomStats() != null) {
            customStats = profile.getCustomStats().stream()
                    .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                    .map(s -> PortfolioPublicResponse.CustomStatDto.builder()
                            .label(s.getLabel())
                            .value(s.getValue())
                            .build())
                    .collect(Collectors.toList());
        }
        return PortfolioPublicResponse.StatsDto.builder()
                .yearsInBusiness(profile.getYearsInBusiness())
                .customersServed(profile.getCustomersServed())
                .customStats(customStats)
                .build();
    }

    private PortfolioReviewAdminResponse toReviewAdminResponse(PortfolioReview review) {
        return PortfolioReviewAdminResponse.builder()
                .id(review.getId())
                .customerName(review.getCustomerName())
                .customerEmail(review.getCustomerEmail())
                .customerPhone(review.getCustomerPhone())
                .rating(review.getRating())
                .title(review.getTitle())
                .comment(review.getComment())
                .isApproved(review.getIsApproved())
                .wouldRecommend(review.getWouldRecommend())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
