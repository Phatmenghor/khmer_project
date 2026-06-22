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
@Tag(name = "Storage Admin", description = "Bulk delete — Basic Auth protected")
public class StorageAdminController {

    private final StorageService storageService;

    @DeleteMapping("/all")
    @Operation(summary = "Delete ALL objects under a path prefix")
    public ResponseEntity<Void> deleteAll(@RequestParam("path") String path) {
        storageService.deleteAll(path);
        return ResponseEntity.noContent().build();
    }
}
