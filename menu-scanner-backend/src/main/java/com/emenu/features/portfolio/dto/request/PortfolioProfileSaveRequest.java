package com.emenu.features.portfolio.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class PortfolioProfileSaveRequest {

    @NotBlank
    private String slug;

    private String tagline;

    @NotBlank
    private String description;

    private String logoUrl;

    private String coverImageUrl;

    // Contact
    @NotBlank
    private String contactEmail;

    @NotBlank
    private String contactPhone;

    @Valid
    private List<PortfolioPhoneRequest> contactPhones;

    private String contactWhatsapp;

    private String contactTelegram;

    // Address
    private String address;

    private String mapLink;

    // Social
    @Valid
    private List<PortfolioSocialMediaRequest> socialMedia;

    @Valid
    private List<PortfolioFeatureRequest> features;

    // Stats (all dynamic)
    @Valid
    private List<PortfolioCustomStatRequest> customStats;

    @Valid
    private List<PortfolioHoursRequest> businessHours;

    @Valid
    private List<PortfolioGalleryItemRequest> gallery;

    @Valid
    private List<PortfolioServiceItemRequest> services;

    @Valid
    private List<PortfolioTeamMemberRequest> team;
}
