package com.emenu.features.portfolio.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "portfolio_profile")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioProfile extends BaseUUIDEntity {

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    @Column(name = "business_name")
    private String businessName;

    @Column(name = "slug", unique = true)
    private String slug;

    @Column(name = "tagline")
    private String tagline;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Column(name = "industry")
    private String industry;

    // Contact
    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_phone")
    private String contactPhone;

    @ElementCollection
    @CollectionTable(name = "portfolio_profile_phones", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "phone")
    private List<String> contactPhones = new ArrayList<>();

    @Column(name = "contact_whatsapp")
    private String contactWhatsapp;

    @Column(name = "contact_telegram")
    private String contactTelegram;

    // Address
    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "map_link")
    private String mapLink;

    // Social
    @Column(name = "social_facebook")
    private String socialFacebook;

    @Column(name = "social_instagram")
    private String socialInstagram;

    @Column(name = "social_twitter")
    private String socialTwitter;

    @Column(name = "social_linkedin")
    private String socialLinkedin;

    @Column(name = "social_youtube")
    private String socialYoutube;

    @Column(name = "social_tiktok")
    private String socialTiktok;

    @Column(name = "social_website")
    private String socialWebsite;

    // Features
    @ElementCollection
    @CollectionTable(name = "portfolio_profile_features", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "feature")
    private List<String> features = new ArrayList<>();

    // Stats
    @Column(name = "years_in_business")
    private Integer yearsInBusiness;

    @Column(name = "customers_served")
    private Long customersServed;

    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = false;

    // Relations
    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<PortfolioHours> businessHours = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<PortfolioGalleryItem> gallery = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<PortfolioServiceItem> services = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<PortfolioTeamMember> team = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<PortfolioCustomStat> customStats = new ArrayList<>();
}
