package com.emenu.features.spaces.service;

import com.emenu.features.spaces.dto.response.SpacesImageResponse;
import com.emenu.features.spaces.dto.response.SpacesMultiUploadResponse;
import com.emenu.features.spaces.dto.response.SpacesUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface SpacesService {

    SpacesUploadResponse upload(MultipartFile file, UUID businessId);

    /** Upload once → generate sm/md/lg/o sizes → return all 4 */
    SpacesMultiUploadResponse uploadMulti(MultipartFile file, UUID businessId);

    void deleteByKey(String key);

    void deleteByDate(UUID businessId, String datePrefix);

    void deleteAllByBusiness(UUID businessId);

    List<SpacesImageResponse> getByBusiness(UUID businessId);
}
