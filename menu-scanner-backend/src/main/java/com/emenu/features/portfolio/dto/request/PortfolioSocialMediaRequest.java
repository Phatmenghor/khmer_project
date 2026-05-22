package com.emenu.features.portfolio.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class PortfolioSocialMediaRequest {
    private UUID id;
    private String name;
    private String url;
}
