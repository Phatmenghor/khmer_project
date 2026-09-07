package com.emenu.features.storage.controller;

import com.emenu.config.security.model.ApiKeyContext;
import com.emenu.features.storage.dto.response.StorageMultiUploadResponse;
import com.emenu.features.storage.dto.response.StorageUploadResponse;
import com.emenu.features.storage.service.StorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/storage")
@RequiredArgsConstructor
@Slf4j
public class StorageController {

    private final StorageService storageService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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

    @GetMapping("/files/{*key}")
    public ResponseEntity<byte[]> getFile(@PathVariable String key) {
        String cleanKey = key;
        if (cleanKey.startsWith("/")) {
            cleanKey = cleanKey.substring(1);
        }
        log.info("Retrieve file requested: key=[{}]", cleanKey);
        byte[] data = storageService.getFile(cleanKey);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(data);
    }
}
