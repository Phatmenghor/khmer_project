package com.emenu.features.spaces.service;

import com.emenu.features.spaces.dto.response.SpacesUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface SpacesService {

    /** Upload — key = b/{businessId}/{week}/{name} */
    SpacesUploadResponse upload(MultipartFile file, UUID businessId, String name);

    /** Delete one exact object by its full key */
    void deleteByKey(UUID businessId, String key);

    /**
     * Delete by date prefix — pass any of:
     *   "2024-"       → whole year
     *   "2024-06-"    → whole month
     *   "2024-06-07/" → single day
     */
    void deleteByDate(UUID businessId, String datePrefix);

    /** Delete everything for a business — b/{businessId}/ */
    void deleteAllByBusiness(UUID businessId);
}
