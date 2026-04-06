package com.emenu.features.location.dto.request;

import lombok.Data;

@Data
public class LocationImageRequest {
    private String imageUrl; // Image URL or file path
    private Integer displayOrder; // Order of display
}
