package com.emenu.features.storage.controller;

import com.emenu.config.security.model.ApiKeyContext;
import com.emenu.features.storage.service.StorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/storage")
@RequiredArgsConstructor
public class StorageAdminController {

    private final StorageService storageService;

    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAll(
            @RequestParam("path") String customPath,
            HttpServletRequest request
    ) {
        storageService.deleteAll(customPath, ApiKeyContext.from(request));
        return ResponseEntity.noContent().build();
    }
}
