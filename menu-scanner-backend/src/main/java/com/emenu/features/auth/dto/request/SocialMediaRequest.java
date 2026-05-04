package com.emenu.features.auth.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Social Media Request DTO
 * Used for creating and updating social media links
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SocialMediaRequest {
    private UUID id;                    // Optional for updates, null for new items
    private String name;                // e.g., "Facebook", "Instagram"
    private String imageUrl;            // Icon/logo URL (optional, fallback to default)
    private String linkUrl;             // Link to the social media profile
}
