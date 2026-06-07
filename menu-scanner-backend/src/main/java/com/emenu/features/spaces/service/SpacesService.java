package com.emenu.features.spaces.service;

import com.emenu.features.spaces.dto.response.SpacesUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface SpacesService {

    /** Upload — key = b/{businessId}/{week}/{name} */
    SpacesUploadResponse upload(MultipartFile file, UUID businessId, String name);

    /** Delete one exact object by its full key */
    void deleteByKey(UUID businessId, String key);

    /** Delete one week of uploads — b/{businessId}/{week}/ */
    void deleteByWeek(UUID businessId, String week);

    /** Delete everything for a business — b/{businessId}/ */
    void deleteAllByBusiness(UUID businessId);
}
