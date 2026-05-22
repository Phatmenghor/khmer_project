package com.emenu.features.portfolio.dto.filter;

import com.emenu.shared.dto.BaseFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class PortfolioReviewFilterRequest extends BaseFilterRequest {
    // businessId is retrieved from authenticated user context
}
