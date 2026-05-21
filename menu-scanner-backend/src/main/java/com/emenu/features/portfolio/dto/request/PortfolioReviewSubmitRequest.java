package com.emenu.features.portfolio.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PortfolioReviewSubmitRequest {

    @NotBlank
    private String customerName;

    private String customerEmail;

    private String customerPhone;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    private String title;

    @NotBlank
    private String comment;

    private Boolean wouldRecommend;
}
