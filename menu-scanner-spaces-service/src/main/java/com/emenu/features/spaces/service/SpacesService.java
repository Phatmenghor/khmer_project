package com.emenu.features.spaces.service;

import com.emenu.config.security.model.ApiKeyContext;
import com.emenu.features.spaces.dto.response.SpacesImageResponse;
import com.emenu.features.spaces.dto.response.SpacesMultiUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * All upload / delete / query operations.
 *
 * <p><strong>Context</strong> is always resolved from the registered API key
 * ({@link ApiKeyContext}) — no businessId form field, no project-code header
 * is required on any endpoint.</p>
 *
 * <ul>
 *   <li>{@code projectCode} — e.g. "emenu"</li>
 *   <li>{@code path}        — e.g. "b/abc-123", "owner", "customer",
 *                             or null → files land at projectCode/yyyy-MM-dd/</li>
 * </ul>
 *
 * <p>Storage key pattern:
 * <pre>
 *   {projectCode}/{path}/{yyyy-MM-dd}/{filename}   (when path != null)
 *   {projectCode}/{yyyy-MM-dd}/{filename}           (when path == null)
 * </pre>
 */
public interface SpacesService {

    /**
     * Upload a file and generate sm / md / o (original) variants.
     * Context (projectCode + path) is taken from the API key, combined with customPath.
     */
    SpacesMultiUploadResponse upload(MultipartFile file, String customPath, ApiKeyContext ctx);

    /** Delete a single object by its full storage key. */
    void deleteByKey(String key);

    /** Delete all objects under a given date prefix for the key's path. */
    void deleteByDate(String datePrefix, String customPath, ApiKeyContext ctx);

    /** Delete ALL objects stored under the key's projectCode/path. */
    void deleteAll(String customPath, ApiKeyContext ctx);

    /** Return all image log entries matching the key's projectCode + path. */
    List<SpacesImageResponse> getLogs(String customPath, ApiKeyContext ctx);
}
