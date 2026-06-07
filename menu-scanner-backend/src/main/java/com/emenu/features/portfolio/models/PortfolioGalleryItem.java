package com.emenu.features.portfolio.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import com.emenu.shared.dto.ImageUrls;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "portfolio_gallery")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioGalleryItem extends BaseUUIDEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private PortfolioProfile profile;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "image", columnDefinition = "jsonb")
    private ImageUrls image;

    @Column(name = "title")
    private String title;
}
