package com.emenu.features.portfolio.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioReviewAdminResponse {

    private UUID id;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Integer rating;
    private String title;
    private String comment;
    private Boolean wouldRecommend;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
