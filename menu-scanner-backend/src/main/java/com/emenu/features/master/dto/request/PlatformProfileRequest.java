package com.emenu.features.master.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformProfileRequest {

    @NotBlank(message = "Brand name is required")
    private String brandName;

    private String brandSlogan;
    private String supportEmail;
    private String supportTelegram;
    private String supportPhone;
    private String address;
    private String description;
    private String logoUrl;
    private String facebookUrl;
    private String websiteUrl;
}
