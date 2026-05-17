package com.emenu.features.auth.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SocialMediaRequest {
    private UUID id;
    private String name;
    private String imageUrl;
    private String linkUrl;
}
