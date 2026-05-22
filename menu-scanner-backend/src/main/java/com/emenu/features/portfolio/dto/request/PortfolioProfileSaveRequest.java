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

    private List<String> contactPhones;

    private String contactWhatsapp;

    private String contactTelegram;

    // Address
    private String addressStreet;

    private String addressCity;

    private String addressState;

    private String addressCountry;

    private String addressPostalCode;

    private String mapLink;

    // Social
    private String socialFacebook;

    private String socialInstagram;

    private String socialTwitter;

    private String socialLinkedin;

    private String socialYoutube;

    private String socialTiktok;

    private String socialWebsite;

    private List<String> features;

    // Stats
    private Integer yearsInBusiness;

    private Long customersServed;

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
