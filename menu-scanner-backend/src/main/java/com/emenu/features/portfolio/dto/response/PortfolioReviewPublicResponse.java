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
public class PortfolioReviewPublicResponse {

    private UUID id;
    private String customerName;
    private String customerPhone;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
