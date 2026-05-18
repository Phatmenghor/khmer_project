package com.emenu.features.location.service.impl;

import com.emenu.exception.custom.NotFoundException;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.models.User;
import com.emenu.features.location.dto.filter.LocationFilterRequest;
import com.emenu.features.location.dto.request.LocationCreateRequest;
import com.emenu.features.location.dto.response.LocationResponse;
import com.emenu.features.location.dto.update.LocationUpdateRequest;
import com.emenu.features.location.mapper.LocationMapper;
import com.emenu.features.location.models.Location;
import com.emenu.features.location.models.LocationImage;
import com.emenu.features.location.repository.LocationRepository;
import com.emenu.features.location.service.LocationService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LocationServiceImpl implements LocationService {

    private final LocationRepository addressRepository;
    private final LocationMapper addressMapper;
    private final SecurityUtils securityUtils;
    private final PaginationMapper paginationMapper;

    @Override
    public LocationResponse createAddress(LocationCreateRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        Location address = addressMapper.toEntity(request);
        address.setUserId(currentUser.getId());

        if (request.getIsDefault() || !hasDefaultAddress(currentUser.getId())) {
            clearDefaultForUser(currentUser.getId());
            address.setAsDefault();
        }

        Location savedAddress = addressRepository.save(address);
        addLocationImages(savedAddress, request.getLocationImages());

        if (request.getLocationImages() != null && !request.getLocationImages().isEmpty()) {
            savedAddress = addressRepository.save(savedAddress);
        }

        log.info("Location created successfully: id={}, userId={}", savedAddress.getId(), currentUser.getId());
        return addressMapper.toResponse(savedAddress);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<LocationResponse> getAllAddresses(LocationFilterRequest filter) {
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<Location> addressPage = addressRepository.findAllWithFilters(
                filter.getUserId(),
                filter.getSearch(),
                pageable
        );
        return addressMapper.toPaginationResponse(addressPage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationResponse> getMyAddressesList() {
        User currentUser = securityUtils.getCurrentUser();
        List<Location> addresses = addressRepository
                .findByUserIdAndIsDeletedFalseOrderByIsDefaultDescCreatedAtDesc(currentUser.getId());
        return addressMapper.toResponseList(addresses);
    }

    @Override
    @Transactional(readOnly = true)
    public LocationResponse getAddressById(UUID id) {
        User currentUser = securityUtils.getCurrentUser();
        Location address = findLocationById(id);
        validateOwnership(address, currentUser, "access");
        return addressMapper.toResponse(address);
    }

    @Override
    public LocationResponse updateAddress(UUID id, LocationUpdateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Location address = findLocationById(id);
        validateOwnership(address, currentUser, "update");

        addressMapper.updateEntity(request, address);
        updateLocationImages(address, request.getLocationImages());
        handleDefaultAddressLogic(address, request.getIsDefault(), currentUser);

        Location updatedAddress = addressRepository.save(address);
        log.info("Location updated successfully: id={}, userId={}", id, currentUser.getId());
        return addressMapper.toResponse(updatedAddress);
    }

    @Override
    public LocationResponse deleteAddress(UUID id) {
        User currentUser = securityUtils.getCurrentUser();
        Location address = findLocationById(id);
        validateOwnership(address, currentUser, "delete");

        address.softDelete();
        addressRepository.save(address);

        log.info("Location deleted successfully: id={}, userId={}", id, currentUser.getId());
        return addressMapper.toResponse(address);
    }

    @Override
    @Transactional(readOnly = true)
    public LocationResponse getDefaultAddress() {
        User currentUser = securityUtils.getCurrentUser();
        Location defaultAddress = addressRepository
                .findByUserIdAndIsDefaultTrueAndIsDeletedFalse(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("No default address found"));
        return addressMapper.toResponse(defaultAddress);
    }

    private Location findLocationById(UUID id) {
        return addressRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Address not found"));
    }

    private void validateOwnership(Location address, User currentUser, String action) {
        if (!address.getUserId().equals(currentUser.getId())) {
            throw new ValidationException("You can only " + action + " your own addresses");
        }
    }

    private void addLocationImages(Location location, List<com.emenu.features.location.dto.request.LocationImageRequest> imageRequests) {
        if (imageRequests == null || imageRequests.isEmpty()) return;
        for (var imageRequest : imageRequests) {
            var locationImage = new LocationImage();
            locationImage.setLocation(location);
            locationImage.setImageUrl(imageRequest.getImageUrl());
            location.getLocationImages().add(locationImage);
        }
    }

    private void updateLocationImages(Location address, List<com.emenu.features.location.dto.request.LocationImageRequest> imageRequests) {
        if (imageRequests == null || imageRequests.isEmpty()) return;
        address.getLocationImages().clear();
        for (var imageRequest : imageRequests) {
            var locationImage = new LocationImage();
            locationImage.setLocation(address);
            locationImage.setImageUrl(imageRequest.getImageUrl());
            address.getLocationImages().add(locationImage);
        }
    }

    private void handleDefaultAddressLogic(Location address, Boolean isDefault, User currentUser) {
        if (Boolean.TRUE.equals(isDefault)) {
            clearDefaultForUser(currentUser.getId());
            address.setAsDefault();
        } else if (Boolean.FALSE.equals(isDefault)) {
            address.unsetDefault();
        }
    }

    private boolean hasDefaultAddress(UUID userId) {
        return addressRepository.findByUserIdAndIsDefaultTrueAndIsDeletedFalse(userId).isPresent();
    }

    private void clearDefaultForUser(UUID userId) {
        addressRepository.clearDefaultForUser(userId);
    }
}