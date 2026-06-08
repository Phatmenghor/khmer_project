package com.emenu.features.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubdomainResolveResponse {
    private UUID businessId;
    private String businessName;
    private String subdomain;
    private String primaryColor;
}
