package com.emenu.features.portfolio.dto.filter;

import com.emenu.shared.dto.BaseFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
public class PortfolioReviewFilterRequest extends BaseFilterRequest {

    private UUID businessId;

    private Boolean isApproved; // null=all, true=approved, false=pending
}
