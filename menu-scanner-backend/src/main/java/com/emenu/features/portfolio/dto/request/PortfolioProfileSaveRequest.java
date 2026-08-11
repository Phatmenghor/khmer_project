package com.emenu.features.portfolio.dto.request;

import com.emenu.shared.dto.ImageUrls;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class PortfolioProfileSaveRequest {

    @NotBlank
    private String description;

    private ImageUrls coverImage;

    @Valid
    private ContactRequest contact;

    @Valid
    private List<PortfolioSocialMediaRequest> socialMedia;

    @Valid
    private List<PortfolioHoursRequest> businessHours;

    @Valid
    private List<PortfolioGalleryItemRequest> gallery;

    @Valid
    private List<PortfolioServiceItemRequest> services;

    @Valid
    private List<PortfolioTeamMemberRequest> team;

    @Valid
    private List<PortfolioFeatureRequest> features;

    @Valid
    private List<PortfolioCustomStatRequest> customStats;

    @Data
    public static class ContactRequest {
        private String email;
        private String phone;
        @Valid
        private List<PortfolioPhoneRequest> phones;
        private String telegram;
        private String address;
        private String mapLink;
    }
}
