package com.emenu.features.spaces.controller;

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

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/spaces")
@RequiredArgsConstructor
@Tag(name = "Spaces Storage", description = "Public image upload/delete — no auth required")
public class SpacesController {

    private final SpacesService spacesService;

    /**
     * Upload an image.
     *
     * Form fields:
     *   file       — the image file
     *   businessId — UUID of the business
     *   size       — sm | md | lg | o  (default: o)
     *
     * Returns: { key, url }
     * Store both in DB — key is needed for delete.
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image — returns key and CDN url")
    public ResponseEntity<SpacesUploadResponse> upload(
            @RequestPart("file") MultipartFile file,
            @RequestPart("businessId") String businessId,
            @RequestPart(value = "size", required = false) String size
    ) {
        String name = StorageNameUtil.generate(size != null ? size : "o");
        return ResponseEntity.ok(
                spacesService.upload(file, UUID.fromString(businessId), name)
        );
    }

    /**
     * Delete one exact object by its key.
     * key = full value returned from upload, e.g.
     *   b/{businessId}/2024-06-07/20240607T143022-a3f2-sm.webp
     */
    @DeleteMapping("/object")
    @Operation(summary = "Delete one image by its exact key")
    public ResponseEntity<Void> deleteByKey(@RequestParam String key) {
        spacesService.deleteByKey(key);
        return ResponseEntity.noContent().build();
    }

    /**
     * Delete by date prefix.
     *   2024-        → whole year
     *   2024-06-     → whole month
     *   2024-06-07/  → single day
     */
    @DeleteMapping("/date")
    @Operation(summary = "Delete by date prefix — 2024- / 2024-06- / 2024-06-07/")
    public ResponseEntity<Void> deleteByDate(
            @RequestParam String businessId,
            @RequestParam String prefix
    ) {
        spacesService.deleteByDate(UUID.fromString(businessId), prefix);
        return ResponseEntity.noContent().build();
    }
}
