package com.emenu.features.storage.controller;

import com.emenu.features.storage.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/storage")
@RequiredArgsConstructor
@Tag(name = "Storage Admin", description = "Bulk delete — Basic Auth protected, requires explicit projectCode + pathStore")
public class StorageAdminController {

    private final StorageService storageService;

    @DeleteMapping("/all")
    @Operation(summary = "Delete ALL objects for a project's path scope")
    public ResponseEntity<Void> deleteAll(
            @RequestParam("projectCode") String projectCode,
            @RequestParam("pathStore") String pathStore,
            @RequestParam("path") String customPath
    ) {
        storageService.deleteAll(projectCode, pathStore, customPath);
        return ResponseEntity.noContent().build();
    }
}
