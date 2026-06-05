package com.emenu.features.portfolio.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "portfolio_review",
        indexes = {
                @Index(name = "idx_portfolio_review_profile_id",  columnList = "profile_id"),
                @Index(name = "idx_portfolio_review_business_id", columnList = "business_id")
        }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioReview extends BaseUUIDEntity {

    @Column(name = "profile_id", nullable = false)
    private UUID profileId;

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_phone")
    private String customerPhone;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "comment", columnDefinition = "TEXT", nullable = false)
    private String comment;
}
