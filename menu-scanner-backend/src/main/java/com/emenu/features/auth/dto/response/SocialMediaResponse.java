package com.emenu.features.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SocialMediaResponse {
    private UUID id;
    private String name;
    private String imageUrl;
    private String linkUrl;
}
