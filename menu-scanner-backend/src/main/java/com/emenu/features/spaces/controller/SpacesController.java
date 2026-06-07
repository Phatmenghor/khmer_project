package com.emenu.features.spaces.controller;

import com.emenu.features.spaces.dto.response.SpacesUploadResponse;
import com.emenu.features.spaces.service.SpacesService;
import com.emenu.features.spaces.util.StorageNameUtil;
import com.emenu.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/owner/spaces")
@RequiredArgsConstructor
@Tag(name = "Spaces Storage", description = "businessId resolved from auth — flat week-grouped storage")
public class SpacesController {

    private final SpacesService spacesService;
    private final SecurityUtils securityUtils;

    /**
     * Upload an image.
     * size: sm | md | lg | o  (default o)
     *
     * Backend generates the name and week folder automatically.
     * Returns the full key and CDN URL — store both in DB.
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image — key auto-generated as b/{businessId}/{week}/{datetime}-{size}.webp")
    public ResponseEntity<SpacesUploadResponse> upload(
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "size", required = false) String size
    ) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        String name = StorageNameUtil.generate(size != null ? size : "o");
        return ResponseEntity.ok(spacesService.upload(file, businessId, name));
    }

    /**
     * Delete one exact object by its key.
     * key = full path returned from upload, e.g.
     *   b/{businessId}/2024-W23/20240607T143022-a3f2-sm.webp
     */
    @DeleteMapping("/object")
    @Operation(summary = "Delete one image by its exact key")
    public ResponseEntity<Void> deleteByKey(@RequestParam String key) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        spacesService.deleteByKey(businessId, key);
        return ResponseEntity.noContent().build();
    }

    /**
     * Delete all uploads from one week.
     * week = ISO week string, e.g. 2024-W23
     */
    @DeleteMapping("/week/{week}")
    @Operation(summary = "Delete all images uploaded in a given week — e.g. 2024-W23")
    public ResponseEntity<Void> deleteByWeek(@PathVariable String week) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        spacesService.deleteByWeek(businessId, week);
        return ResponseEntity.noContent().build();
    }
}
