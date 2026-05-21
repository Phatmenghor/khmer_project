package com.emenu.features.portfolio.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewStatsResponse {

    private Double averageRating;

    private Long totalReviews;

    private Map<Integer, Long> distribution; // {1: 0, 2: 0, 3: 0, 4: 2, 5: 3}
}
