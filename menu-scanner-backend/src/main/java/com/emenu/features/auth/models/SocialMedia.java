package com.emenu.features.auth.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * SocialMedia Entity
 * Represents a social media account linked to business settings
 * Has automatic audit fields: createdAt, updatedAt, createdBy, updatedBy, isDeleted
 */
@Entity
@Table(name = "social_media")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class SocialMedia extends BaseUUIDEntity {

    @Column(name = "business_setting_id", nullable = false)
    private UUID businessSettingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_setting_id", insertable = false, updatable = false)
    private BusinessSetting businessSetting;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "link_url")
    private String linkUrl;
}
