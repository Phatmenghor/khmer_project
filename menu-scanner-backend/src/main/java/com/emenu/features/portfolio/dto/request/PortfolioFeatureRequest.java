package com.emenu.features.portfolio.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PortfolioFeatureRequest {
    private UUID id;
    private String name;
}
