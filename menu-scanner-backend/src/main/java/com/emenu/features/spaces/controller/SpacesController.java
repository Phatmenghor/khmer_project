package com.emenu.features.spaces.controller;

import com.emenu.features.spaces.dto.response.SpacesImageResponse;
import com.emenu.features.spaces.dto.response.SpacesUploadResponse;
import com.emenu.features.spaces.service.SpacesService;
import com.emenu.features.spaces.util.StorageNameUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/spaces")
@RequiredArgsConstructor
@Tag(name = "Spaces Storage", description = "Public image upload/delete/log — no auth required")
public class SpacesController {

    private final SpacesService spacesService;

    /**
     * Upload an image.
     * size:       sm | md | lg | o  (default o)
     * entityType: product | category | logo | banner | qr | staff  (optional label)
     * entityId:   id of the related entity (optional)
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image — logged to DB with key, url, size, entity info")
    public ResponseEntity<SpacesUploadResponse> upload(
            @RequestPart("file") MultipartFile file,
            @RequestPart("businessId") String businessId,
            @RequestPart(value = "size", required = false) String size,
            @RequestPart(value = "entityType", required = false) String entityType,
            @RequestPart(value = "entityId", required = false) String entityId
    ) {
        String name = StorageNameUtil.generate(size != null ? size : "o");
        return ResponseEntity.ok(
                spacesService.upload(file, UUID.fromString(businessId), name, entityType, entityId)
        );
    }

    /** Delete one image by its exact key — removes from Spaces + DB */
    @DeleteMapping("/object")
    @Operation(summary = "Delete one image by key")
    public ResponseEntity<Void> deleteByKey(@RequestParam String key) {
        spacesService.deleteByKey(key);
        return ResponseEntity.noContent().build();
    }

    /** Delete by date prefix — 2024- / 2024-06- / 2024-06-07/ */
    @DeleteMapping("/date")
    @Operation(summary = "Delete by date prefix")
    public ResponseEntity<Void> deleteByDate(
            @RequestParam String businessId,
            @RequestParam String prefix
    ) {
        spacesService.deleteByDate(UUID.fromString(businessId), prefix);
        return ResponseEntity.noContent().build();
    }

    /** Get all image logs for a business */
    @GetMapping("/logs/{businessId}")
    @Operation(summary = "Get all image logs for a business")
    public ResponseEntity<List<SpacesImageResponse>> getLogs(@PathVariable UUID businessId) {
        return ResponseEntity.ok(spacesService.getByBusiness(businessId));
    }

    /** Get image logs for a specific entity */
    @GetMapping("/logs/{businessId}/{entityType}/{entityId}")
    @Operation(summary = "Get image logs for a specific entity")
    public ResponseEntity<List<SpacesImageResponse>> getEntityLogs(
            @PathVariable UUID businessId,
            @PathVariable String entityType,
            @PathVariable String entityId
    ) {
        return ResponseEntity.ok(spacesService.getByEntity(businessId, entityType, entityId));
    }
}
