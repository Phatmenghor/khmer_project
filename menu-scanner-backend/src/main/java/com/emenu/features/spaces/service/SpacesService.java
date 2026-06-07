package com.emenu.features.spaces.service;

import com.emenu.features.spaces.dto.response.SpacesUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface SpacesService {

    /** Upload — key = b/{businessId}/{week}/{name} */
    SpacesUploadResponse upload(MultipartFile file, UUID businessId, String name);

    /** Delete one exact object by its full key */
    void deleteByKey(UUID businessId, String key);

    /** Delete one year  — b/{businessId}/yyyy/ */
    void deleteByYear(UUID businessId, int year);

    /** Delete one month — b/{businessId}/yyyy/MM/ */
    void deleteByMonth(UUID businessId, int year, int month);

    /** Delete one day   — b/{businessId}/yyyy/MM/dd/ */
    void deleteByDay(UUID businessId, int year, int month, int day);

    /** Delete everything for a business — b/{businessId}/ */
    void deleteAllByBusiness(UUID businessId);
}
