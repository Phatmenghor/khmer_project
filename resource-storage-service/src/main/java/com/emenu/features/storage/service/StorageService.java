package com.emenu.features.storage.service;

import com.emenu.config.security.model.ApiKeyContext;
import com.emenu.features.storage.dto.response.StorageMultiUploadResponse;
import org.springframework.web.multipart.MultipartFile;

/**
 * Upload / delete operations for resources belonging to any project.
 *
 * <p>Context is always resolved from the registered API key
 * ({@link ApiKeyContext}) — no businessId form field, no project-code header
 * is required on any endpoint.</p>
 *
 * <p>{@code pathStore} (the API key's stored path, e.g. "b/abc-123", "owner",
 * "customer") combined with the required {@code customPath} request param
 * forms the storage key. {@code projectCode} is not part of the storage
 * path — it is only used when creating the API key.</p>
 *
 * <p>Storage key pattern:
 * <pre>
 *   {pathStore}/{customPath}/{yyyy-MM-dd}/{filename}
 * </pre>
 */
public interface StorageService {

    StorageMultiUploadResponse upload(MultipartFile file, String customPath, ApiKeyContext ctx);

    void deleteAll(String customPath, ApiKeyContext ctx);
}
