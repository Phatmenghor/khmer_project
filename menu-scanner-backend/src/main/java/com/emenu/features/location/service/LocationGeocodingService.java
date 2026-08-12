package com.emenu.features.location.service;

import com.emenu.features.location.dto.response.LocationGeocodingResponse;
import com.emenu.features.location.dto.response.PlaceAutocompleteResponse;

import java.util.List;

public interface LocationGeocodingService {

    LocationGeocodingResponse reverseGeocode(Double latitude, Double longitude);

    LocationGeocodingResponse geocodeAddress(String address);

    List<PlaceAutocompleteResponse> autocompletePlaces(String input);
}
