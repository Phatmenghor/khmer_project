package com.emenu.features.portfolio.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioAdminResponse {

    private UUID id;
    private String slug;
    private String businessName;
    private String tagline;
    private String description;
    private String logoUrl;
    private String coverImageUrl;
    private String industry;
    private Boolean isPublished;
    private PortfolioPublicResponse.ContactDto contact;
    private PortfolioPublicResponse.SocialMediaDto socialMedia;
    private List<PortfolioPublicResponse.HoursDto> businessHours;
    private List<PortfolioPublicResponse.GalleryItemDto> gallery;
    private List<PortfolioPublicResponse.ServiceItemDto> services;
    private List<PortfolioPublicResponse.TeamMemberDto> team;
    private List<PortfolioPublicResponse.FeatureDto> features;
    private PortfolioPublicResponse.StatsDto stats;
    private ReviewStatsResponse reviewStats;
    private String createdAt;
    private String updatedAt;
}
