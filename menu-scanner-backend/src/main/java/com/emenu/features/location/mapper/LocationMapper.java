package com.emenu.features.location.mapper;

import com.emenu.features.location.dto.request.LocationCreateRequest;
import com.emenu.features.location.dto.response.LocationImageResponse;
import com.emenu.features.location.dto.response.LocationResponse;
import com.emenu.features.location.dto.update.LocationUpdateRequest;
import com.emenu.features.location.models.Location;
import com.emenu.features.location.models.LocationImage;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import org.mapstruct.*;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PaginationMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface LocationMapper {

    Location toEntity(LocationCreateRequest request);

    @Mapping(target = "fullAddress", expression = "java(address.getFullAddress())")
    @Mapping(target = "hasCoordinates", expression = "java(address.hasCoordinates())")
    @Mapping(target = "locationImages", expression = "java(toLocationImageResponseList(address.getLocationImages()))")
    LocationResponse toResponse(Location address);

    List<LocationResponse> toResponseList(List<Location> addresses);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(LocationUpdateRequest request, @MappingTarget Location address);

    default LocationImageResponse toLocationImageResponse(LocationImage image) {
        if (image == null) return null;
        LocationImageResponse response = new LocationImageResponse();
        response.setLocationId(image.getLocation() != null ? image.getLocation().getId() : null);
        response.setImageUrl(image.getImageUrl());
        response.setId(image.getId());
        response.setCreatedAt(image.getCreatedAt());
        response.setUpdatedAt(image.getUpdatedAt());
        response.setCreatedBy(image.getCreatedBy());
        response.setUpdatedBy(image.getUpdatedBy());
        return response;
    }

    default List<LocationImageResponse> toLocationImageResponseList(List<LocationImage> images) {
        if (images == null) return null;
        return images.stream().map(this::toLocationImageResponse).toList();
    }

    default PaginationResponse<LocationResponse> toPaginationResponse(Page<Location> addresses, PaginationMapper paginationMapper) {
return paginationMapper.toPaginationResponse(addresses, this::toResponseList);
    }
}