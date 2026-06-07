package com.emenu.features.spaces.service;

import com.emenu.features.spaces.dto.response.SpacesImageResponse;
import com.emenu.features.spaces.dto.response.SpacesUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface SpacesService {

    SpacesUploadResponse upload(MultipartFile file, UUID businessId, String size);

    void deleteByKey(String key);

    void deleteByDate(UUID businessId, String datePrefix);

    void deleteAllByBusiness(UUID businessId);

    List<SpacesImageResponse> getByBusiness(UUID businessId);
}
