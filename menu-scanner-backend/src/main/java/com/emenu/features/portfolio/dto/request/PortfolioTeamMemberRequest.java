package com.emenu.features.portfolio.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PortfolioTeamMemberRequest {

    private String id;

    @NotBlank
    private String name;

    @NotBlank
    private String position;

    private String bio;

    private String photoUrl;
}
