package com.emenu.features.master.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformProfileResponse {

    private Long id;
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
