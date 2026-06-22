package com.emenu.features.spaces.service;

import com.emenu.config.security.model.ApiKeyContext;
import com.emenu.features.spaces.dto.response.SpacesMultiUploadResponse;
import org.springframework.web.multipart.MultipartFile;

/**
 * Upload / delete operations.
 *
 * <p><strong>Context</strong> is always resolved from the registered API key
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
public interface SpacesService {

    /**
     * Upload a file and generate sm / md / o (original) variants.
     * Path is taken from the API key's pathStore, combined with customPath.
     */
    SpacesMultiUploadResponse upload(MultipartFile file, String customPath, ApiKeyContext ctx);

    /** Delete ALL objects stored under the key's resolved path. */
    void deleteAll(String customPath, ApiKeyContext ctx);
}
