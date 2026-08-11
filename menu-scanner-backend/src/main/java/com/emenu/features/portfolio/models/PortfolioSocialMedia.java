package com.emenu.features.portfolio.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "portfolio_social_media")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioSocialMedia extends BaseUUIDEntity {

    @Column(name = "profile_id", nullable = false)
    private UUID profileId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", insertable = false, updatable = false)
    private PortfolioProfile profile;

    @Column(name = "name")
    private String name;

    @Column(name = "url")
    private String url;
}
