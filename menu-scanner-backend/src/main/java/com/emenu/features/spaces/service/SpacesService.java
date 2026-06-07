package com.emenu.features.spaces.service;

import com.emenu.features.spaces.dto.request.SpacesUploadRequest;
import com.emenu.features.spaces.dto.response.SpacesUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface SpacesService {

    SpacesUploadResponse upload(MultipartFile file, SpacesUploadRequest request, UUID businessId);

    void deleteByEntity(UUID businessId, String entityType, String entityId);

    void deleteAllByBusiness(UUID businessId);
}
