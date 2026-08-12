package com.emenu.features.location.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceAutocompleteResponse {
    private String placeId;
    private String description;
    private String mainText;
    private String secondaryText;
}
