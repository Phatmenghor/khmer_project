package com.emenu.features.storage.controller;

import com.emenu.config.security.model.ApiKeyContext;
import com.emenu.features.storage.dto.response.StorageMultiUploadResponse;
import com.emenu.features.storage.dto.response.StorageUploadResponse;
import com.emenu.features.storage.service.StorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/storage")
@RequiredArgsConstructor
public class StorageController {

    private final StorageService storageService;

    /**
     * Upload a single file.
     * {@code pathStore} comes from the API key; the required {@code path}
     * request param ({@code customPath}) is appended after it:
     * <pre>
     *   {pathStore}/{customPath}/{yyyy-MM-dd}/{filename}
     * </pre>
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StorageUploadResponse> upload(
            @RequestPart("file") MultipartFile file,
            @RequestParam("path") String customPath,
            HttpServletRequest request
    ) {
        ApiKeyContext ctx = ApiKeyContext.from(request);
        return ResponseEntity.ok(storageService.upload(file, customPath, ctx));
    }

    /**
     * Upload a single file and generate sm / md / o (original) size variants.
     * Same path resolution as {@link #upload}.
     */
    @PostMapping(value = "/upload/multi", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StorageMultiUploadResponse> uploadMulti(
            @RequestPart("file") MultipartFile file,
            @RequestParam("path") String customPath,
            HttpServletRequest request
    ) {
        ApiKeyContext ctx = ApiKeyContext.from(request);
        return ResponseEntity.ok(storageService.uploadMulti(file, customPath, ctx));
    }
}
