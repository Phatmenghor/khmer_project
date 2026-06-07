package com.emenu.features.auth.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import com.emenu.shared.dto.ImageUrls;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

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

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "image", columnDefinition = "jsonb")
    private ImageUrls image;

    @Column(name = "link_url")
    private String linkUrl;
}
