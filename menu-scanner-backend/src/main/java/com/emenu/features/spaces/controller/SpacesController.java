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

    @DeleteMapping("/date/{year}")
    @Operation(summary = "Delete all images uploaded in a year — e.g. /date/2024")
    public ResponseEntity<Void> deleteByYear(@PathVariable int year) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        spacesService.deleteByYear(businessId, year);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/date/{year}/{month}")
    @Operation(summary = "Delete all images uploaded in a month — e.g. /date/2024/06")
    public ResponseEntity<Void> deleteByMonth(@PathVariable int year, @PathVariable int month) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        spacesService.deleteByMonth(businessId, year, month);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/date/{year}/{month}/{day}")
    @Operation(summary = "Delete all images uploaded on a day — e.g. /date/2024/06/07")
    public ResponseEntity<Void> deleteByDay(@PathVariable int year, @PathVariable int month, @PathVariable int day) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        spacesService.deleteByDay(businessId, year, month, day);
        return ResponseEntity.noContent().build();
    }
}
