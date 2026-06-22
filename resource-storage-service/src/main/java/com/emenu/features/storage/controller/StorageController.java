package com.emenu.features.storage.controller;

import com.emenu.config.OpenApiConfig;
import com.emenu.config.security.model.ApiKeyContext;
import com.emenu.features.storage.dto.response.StorageMultiUploadResponse;
import com.emenu.features.storage.dto.response.StorageUploadResponse;
import com.emenu.features.storage.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Storage key pattern: {@code {pathStore}/{path}/{yyyy-MM-dd}/{filename}}.
 * {@code pathStore} is resolved from the caller's API key; {@code path} is the
 * dynamic sub-scope (e.g. "business", "owner", "customer") sent as a multipart form field.
 */
@RestController
@RequestMapping("/api/v1/storage")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Storage", description = "Upload — authenticated via X-API-Key")
@SecurityRequirement(name = OpenApiConfig.API_KEY_SCHEME)
public class StorageController {

    private final StorageService storageService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a single file, stored at its original size")
    public ResponseEntity<StorageUploadResponse> upload(
            @RequestPart("file") MultipartFile file,
            @RequestParam("path") String path,
            HttpServletRequest request
    ) {
        ApiKeyContext ctx = ApiKeyContext.from(request);
        log.info("Upload requested: path=[{}], filename=[{}]", path, file.getOriginalFilename());
        StorageUploadResponse response = storageService.upload(file, path, ctx);
        log.info("Upload completed: path=[{}], key=[{}]", path, response.getKey());
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/upload/multi", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a file and generate sm / md / o (original) size variants")
    public ResponseEntity<StorageMultiUploadResponse> uploadMulti(
            @RequestPart("file") MultipartFile file,
            @RequestParam("path") String path,
            HttpServletRequest request
    ) {
        ApiKeyContext ctx = ApiKeyContext.from(request);
        log.info("Multi-upload requested: path=[{}], filename=[{}]", path, file.getOriginalFilename());
        StorageMultiUploadResponse response = storageService.uploadMulti(file, path, ctx);
        log.info("Multi-upload completed: path=[{}], key=[{}]", path, response.getKey());
        return ResponseEntity.ok(response);
    }
}
