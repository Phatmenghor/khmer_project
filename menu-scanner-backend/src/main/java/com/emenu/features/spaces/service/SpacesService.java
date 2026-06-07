package com.emenu.features.spaces.service;

import com.emenu.features.spaces.dto.response.SpacesImageResponse;
import com.emenu.features.spaces.dto.response.SpacesUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface SpacesService {

    /** Upload — stores in Spaces + logs to DB */
    SpacesUploadResponse upload(MultipartFile file, UUID businessId, String name,
                                String entityType, String entityId);

    /** Delete one exact object by key — removes from Spaces + DB */
    void deleteByKey(String key);

    /** Delete by date prefix — removes from Spaces + DB */
    void deleteByDate(UUID businessId, String datePrefix);

    /** Delete all for a business — removes from Spaces + DB */
    void deleteAllByBusiness(UUID businessId);

    /** Get all image logs for a business */
    List<SpacesImageResponse> getByBusiness(UUID businessId);

    /** Get image logs for a specific entity */
    List<SpacesImageResponse> getByEntity(UUID businessId, String entityType, String entityId);
}
