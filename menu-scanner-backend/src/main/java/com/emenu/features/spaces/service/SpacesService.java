package com.emenu.features.spaces.service;

import com.emenu.features.spaces.dto.response.SpacesUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface SpacesService {

    /** Upload file to b/{businessId}/{subPath} */
    SpacesUploadResponse upload(MultipartFile file, UUID businessId, String subPath);

    /** Delete all objects under b/{businessId}/{prefix} (pass "" to wipe everything) */
    void delete(UUID businessId, String prefix);

    /** Delete all objects under b/{businessId}/ — used by admin for cleanup */
    void deleteAllByBusiness(UUID businessId);
}
