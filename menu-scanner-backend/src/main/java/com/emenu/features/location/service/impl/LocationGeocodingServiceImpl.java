package com.emenu.features.location.service.impl;

import com.emenu.features.location.dto.response.LocationGeocodingResponse;
import com.emenu.features.location.dto.response.PlaceAutocompleteResponse;
import com.emenu.features.location.service.LocationGeocodingService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocationGeocodingServiceImpl implements LocationGeocodingService {

    @Value("${app.social.google.maps.api-key:AIzaSyBm9cuaxspSEfAIT3PKYa1naawr8SJ0zA8}")
    private String googleMapsApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public LocationGeocodingResponse reverseGeocode(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            return LocationGeocodingResponse.builder().build();
        }
        try {
            String url = UriComponentsBuilder.fromHttpUrl("https://maps.googleapis.com/maps/api/geocode/json")
                    .queryParam("latlng", latitude + "," + longitude)
                    .queryParam("key", googleMapsApiKey)
                    .build()
                    .toUriString();

            String rawJson = restTemplate.getForObject(url, String.class);
            return parseGeocodeJson(rawJson, latitude, longitude);
        } catch (Exception e) {
            log.error("Failed reverse geocode lat={}, lng={}: {}", latitude, longitude, e.getMessage());
            return LocationGeocodingResponse.builder()
                    .latitude(latitude)
                    .longitude(longitude)
                    .country("Cambodia")
                    .formattedAddress(String.format("%.4f, %.4f", latitude, longitude))
                    .build();
        }
    }

    @Override
    public LocationGeocodingResponse geocodeAddress(String address) {
        if (address == null || address.trim().isEmpty()) {
            return LocationGeocodingResponse.builder().build();
        }
        try {
            String url = UriComponentsBuilder.fromHttpUrl("https://maps.googleapis.com/maps/api/geocode/json")
                    .queryParam("address", address)
                    .queryParam("key", googleMapsApiKey)
                    .build()
                    .toUriString();

            String rawJson = restTemplate.getForObject(url, String.class);
            return parseGeocodeJson(rawJson, null, null);
        } catch (Exception e) {
            log.error("Failed geocode address={}: {}", address, e.getMessage());
            return LocationGeocodingResponse.builder()
                    .formattedAddress(address)
                    .country("Cambodia")
                    .build();
        }
    }

    @Override
    public List<PlaceAutocompleteResponse> autocompletePlaces(String input) {
        List<PlaceAutocompleteResponse> predictionsList = new ArrayList<>();
        if (input == null || input.trim().length() < 2) {
            return predictionsList;
        }

        try {
            String url = UriComponentsBuilder.fromHttpUrl("https://maps.googleapis.com/maps/api/place/autocomplete/json")
                    .queryParam("input", input)
                    .queryParam("key", googleMapsApiKey)
                    .build()
                    .toUriString();

            String rawJson = restTemplate.getForObject(url, String.class);
            if (rawJson != null) {
                JsonNode root = objectMapper.readTree(rawJson);
                JsonNode predictionsNode = root.path("predictions");
                if (predictionsNode.isArray()) {
                    for (JsonNode item : predictionsNode) {
                        String placeId = item.path("place_id").asText("");
                        String description = item.path("description").asText("");
                        JsonNode structured = item.path("structured_formatting");
                        String mainText = structured.path("main_text").asText(description);
                        String secondaryText = structured.path("secondary_text").asText("");

                        predictionsList.add(PlaceAutocompleteResponse.builder()
                                .placeId(placeId)
                                .description(description)
                                .mainText(mainText)
                                .secondaryText(secondaryText)
                                .build());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed place autocomplete for input={}: {}", input, e.getMessage());
        }

        return predictionsList;
    }

    private LocationGeocodingResponse parseGeocodeJson(String rawJson, Double defaultLat, Double defaultLng) {
        LocationGeocodingResponse.LocationGeocodingResponseBuilder builder = LocationGeocodingResponse.builder();
        builder.country("Cambodia");

        if (rawJson == null) {
            builder.latitude(defaultLat);
            builder.longitude(defaultLng);
            return builder.build();
        }

        try {
            JsonNode root = objectMapper.readTree(rawJson);
            JsonNode resultsNode = root.path("results");

            if (resultsNode.isArray() && resultsNode.size() > 0) {
                JsonNode firstResult = resultsNode.get(0);
                String formattedAddress = firstResult.path("formatted_address").asText("");
                builder.formattedAddress(formattedAddress);

                JsonNode locationNode = firstResult.path("geometry").path("location");
                double lat = locationNode.path("lat").asDouble(defaultLat != null ? defaultLat : 0.0);
                double lng = locationNode.path("lng").asDouble(defaultLng != null ? defaultLng : 0.0);
                builder.latitude(lat);
                builder.longitude(lng);

                JsonNode components = firstResult.path("address_components");
                if (components.isArray()) {
                    for (JsonNode component : components) {
                        JsonNode typesNode = component.path("types");
                        List<String> types = new ArrayList<>();
                        if (typesNode.isArray()) {
                            for (JsonNode typeItem : typesNode) {
                                types.add(typeItem.asText());
                            }
                        }

                        String longName = component.path("long_name").asText("");

                        if (types.contains("street_number")) {
                            builder.houseNumber(longName);
                        } else if (types.contains("route")) {
                            builder.streetNumber(longName);
                        } else if (types.contains("neighborhood") || types.contains("sublocality_level_2")) {
                            builder.village(longName);
                        } else if (types.contains("locality") || types.contains("sublocality_level_1")) {
                            builder.commune(longName);
                        } else if (types.contains("administrative_area_level_2")) {
                            builder.district(longName);
                        } else if (types.contains("administrative_area_level_1")) {
                            builder.province(longName);
                        } else if (types.contains("country")) {
                            builder.country(longName.isEmpty() ? "Cambodia" : longName);
                        }
                    }
                }
            } else {
                builder.latitude(defaultLat);
                builder.longitude(defaultLng);
            }
        } catch (Exception e) {
            log.error("Failed to parse geocode response: {}", e.getMessage());
            builder.latitude(defaultLat);
            builder.longitude(defaultLng);
        }

        return builder.build();
    }
}
