package com.emenu.features.portfolio.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PortfolioTeamMemberRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String position;

    private String bio;

    private String photoUrl;

    private Integer displayOrder = 0;
}
