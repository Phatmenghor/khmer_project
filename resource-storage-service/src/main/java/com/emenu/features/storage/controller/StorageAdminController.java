package com.emenu.features.storage.controller;

import com.emenu.config.OpenApiConfig;
import com.emenu.features.storage.dto.request.StorageDeleteRequest;
import com.emenu.features.storage.dto.response.StorageDeleteResponse;
import com.emenu.features.storage.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/storage")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Storage Admin", description = "Bulk delete — Basic Auth protected")
@SecurityRequirement(name = OpenApiConfig.BASIC_AUTH_SCHEME)
public class StorageAdminController {

    private final StorageService storageService;

    @DeleteMapping("/all")
    @Operation(summary = "Delete ALL objects under a path prefix")
    public ResponseEntity<StorageDeleteResponse> deleteAll(@Valid @RequestBody StorageDeleteRequest request) {
        log.info("Delete-all requested: path=[{}]", request.getPath());
        StorageDeleteResponse response = storageService.deleteAll(request.getPath());
        log.info("Delete-all completed: path=[{}], deletedCount=[{}]", response.getPath(), response.getDeletedCount());
        return ResponseEntity.ok(response);
    }
}
