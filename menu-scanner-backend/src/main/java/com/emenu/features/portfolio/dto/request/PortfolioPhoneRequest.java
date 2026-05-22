package com.emenu.features.portfolio.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class PortfolioPhoneRequest {
    private UUID id;
    private String number;
}
