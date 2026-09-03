package com.emenu.features.location.controller;

import com.emenu.features.auth.models.User;
import com.emenu.features.location.dto.filter.LocationFilterRequest;
import com.emenu.features.location.dto.request.LocationCreateRequest;
import com.emenu.features.location.dto.response.LocationGeocodingResponse;
import com.emenu.features.location.dto.response.LocationResponse;
import com.emenu.features.location.dto.response.PlaceAutocompleteResponse;
import com.emenu.features.location.dto.update.LocationUpdateRequest;
import com.emenu.features.location.service.LocationGeocodingService;
import com.emenu.features.location.service.LocationService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService addressService;
    private final LocationGeocodingService geocodingService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<ApiResponse<LocationResponse>> createAddress(@Valid @RequestBody LocationCreateRequest request) {
        LocationResponse address = addressService.createAddress(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Address created successfully", address));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<LocationResponse>>> getAllAddresses(@Valid @RequestBody LocationFilterRequest filter) {
        PaginationResponse<LocationResponse> addresses = addressService.getAllAddresses(filter);
        return ResponseEntity.ok(ApiResponse.success("Addresses retrieved successfully", addresses));
    }

    @PostMapping("/my-addresses/all")
    public ResponseEntity<ApiResponse<PaginationResponse<LocationResponse>>> getMyAddresses(@Valid @RequestBody LocationFilterRequest filter) {
        User currentUser = securityUtils.getCurrentUser();
        filter.setUserId(currentUser.getId());
        PaginationResponse<LocationResponse> addresses = addressService.getAllAddresses(filter);
        return ResponseEntity.ok(ApiResponse.success("My addresses retrieved successfully", addresses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LocationResponse>> getAddressById(@PathVariable UUID id) {
        LocationResponse address = addressService.getAddressById(id);
        return ResponseEntity.ok(ApiResponse.success("Address retrieved successfully", address));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LocationResponse>> updateAddress(
            @PathVariable UUID id, @Valid @RequestBody LocationUpdateRequest request) {
        LocationResponse address = addressService.updateAddress(id, request);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", address));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<LocationResponse>> deleteAddress(@PathVariable UUID id) {
        LocationResponse address = addressService.deleteAddress(id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", address));
    }

    @GetMapping("/default")
    public ResponseEntity<ApiResponse<LocationResponse>> getDefaultAddress() {
        LocationResponse address = addressService.getDefaultAddress();
        return ResponseEntity.ok(ApiResponse.success("Default address retrieved successfully", address));
    }

    @GetMapping("/geocode/reverse")
    public ResponseEntity<ApiResponse<LocationGeocodingResponse>> reverseGeocode(
            @RequestParam("lat") Double lat,
            @RequestParam("lng") Double lng) {
        LocationGeocodingResponse response = geocodingService.reverseGeocode(lat, lng);
        return ResponseEntity.ok(ApiResponse.success("Reverse geocoding retrieved successfully", response));
    }

    @GetMapping("/geocode/search")
    public ResponseEntity<ApiResponse<LocationGeocodingResponse>> geocodeSearch(
            @RequestParam("address") String address) {
        LocationGeocodingResponse response = geocodingService.geocodeAddress(address);
        return ResponseEntity.ok(ApiResponse.success("Geocode search retrieved successfully", response));
    }

    @GetMapping("/geocode/autocomplete")
    public ResponseEntity<ApiResponse<List<PlaceAutocompleteResponse>>> autocompletePlaces(
            @RequestParam("input") String input) {
        List<PlaceAutocompleteResponse> response = geocodingService.autocompletePlaces(input);
        return ResponseEntity.ok(ApiResponse.success("Place autocomplete retrieved successfully", response));
    }
}