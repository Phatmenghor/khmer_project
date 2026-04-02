package com.emenu.features.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Social Media Response DTO
 * Represents a social media account linked to business
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SocialMediaResponse {
    private String name;       // e.g., "Facebook", "Instagram"
    private String imageUrl;   // Icon or logo URL
    private String linkUrl;    // Link to the social media profile
}
