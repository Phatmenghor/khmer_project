package com.emenu.features.spaces.service;

import com.emenu.features.spaces.dto.response.SpacesMultiUploadResponse;
import org.springframework.web.multipart.MultipartFile;

/**
 * Proxy interface for the resource-storage-service.
 *
 * <p>This project uses a single configured API key (its {@code pathStore}
 * is the project's storage scope); callers pass a dynamic {@code path}
 * (customPath) per call — no businessId or project-code is needed.</p>
 *
 * <p>Bulk delete is intentionally not exposed here — it requires the
 * resource-storage-service's admin Basic Auth credentials, which belong
 * only to that project.</p>
 */
public interface SpacesService {

    /** Upload image using a dynamic path. */
    SpacesMultiUploadResponse upload(MultipartFile file, String path);

    /** Upload image for a business. Legacy method, delegates to upload(file, "business"). */
    SpacesMultiUploadResponse uploadForBusiness(MultipartFile file);

    /** Upload image for owner. Legacy method, delegates to upload(file, "owner"). */
    SpacesMultiUploadResponse uploadForOwner(MultipartFile file);

    /** Upload image for customer. Legacy method, delegates to upload(file, "customer"). */
    SpacesMultiUploadResponse uploadForCustomer(MultipartFile file);
}
