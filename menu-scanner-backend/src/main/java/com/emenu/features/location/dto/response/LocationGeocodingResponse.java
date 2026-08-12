package com.emenu.features.location.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationGeocodingResponse {
    private String formattedAddress;
    private String houseNumber;
    private String streetNumber;
    private String village;
    private String commune;
    private String district;
    private String province;
    private String country;
    private Double latitude;
    private Double longitude;
}
