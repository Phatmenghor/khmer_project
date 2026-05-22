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
public class PortfolioResponse {

    private UUID id;
    private String businessName;
    private String description;
    private String logoUrl;
    private String coverImageUrl;
    private String industry;
    private ContactDto contact;
    private List<SocialMediaItemDto> socialMedia;
    private List<HoursDto> businessHours;
    private List<GalleryItemDto> gallery;
    private List<ServiceItemDto> services;
    private List<TeamMemberDto> team;
    private List<FeatureDto> features;
    private List<CustomStatDto> stats;
    private ReviewStatsResponse reviewStats;
    private String createdAt;
    private String updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContactDto {
        private String email;
        private String phone;
        private List<PhoneDto> phones;
        private String whatsapp;
        private String telegram;
        private String address;
        private String mapLink;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PhoneDto {
        private UUID id;
        private String number;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SocialMediaItemDto {
        private UUID id;
        private String name;
        private String url;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HoursDto {
        private UUID id;
        private String day;
        private String openTime;
        private String closeTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GalleryItemDto {
        private UUID id;
        private String url;
        private String title;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceItemDto {
        private UUID id;
        private String name;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamMemberDto {
        private UUID id;
        private String name;
        private String position;
        private String bio;
        private String photoUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomStatDto {
        private UUID id;
        private String label;
        private String value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeatureDto {
        private UUID id;
        private String name;
    }
}
