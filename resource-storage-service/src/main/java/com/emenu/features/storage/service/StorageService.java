package com.emenu.features.storage.service;

import com.emenu.config.security.model.ApiKeyContext;
import com.emenu.features.storage.dto.response.StorageDeleteResponse;
import com.emenu.features.storage.dto.response.StorageMultiUploadResponse;
import com.emenu.features.storage.dto.response.StorageUploadResponse;
import org.springframework.web.multipart.MultipartFile;

/**
 * Upload / delete operations for resources belonging to any project.
 *
 * <p>Upload context ({@code projectCode} + {@code pathStore}) is resolved
 * from the caller's API key ({@link ApiKeyContext}). Storage key pattern:
 * <pre>
 *   {pathStore}/{path}/{yyyy-MM-dd}/{filename}
 * </pre>
 */
public interface StorageService {

    /** Upload a single file, stored as one image. */
    StorageUploadResponse upload(MultipartFile file, String path, ApiKeyContext ctx);

    /** Upload a file and generate sm / md / o (original) size variants. */
    StorageMultiUploadResponse uploadMulti(MultipartFile file, String path, ApiKeyContext ctx);

    /** Admin-only: delete ALL objects under an explicit path prefix. */
    StorageDeleteResponse deleteAll(String path);
}
