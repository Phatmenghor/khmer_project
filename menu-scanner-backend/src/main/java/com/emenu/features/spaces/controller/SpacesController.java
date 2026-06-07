package com.emenu.features.spaces.controller;

import com.emenu.features.spaces.dto.request.SpacesUploadRequest;
import com.emenu.features.spaces.dto.response.SpacesUploadResponse;
import com.emenu.features.spaces.service.SpacesService;
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
@Tag(name = "Spaces Storage", description = "Image upload/delete — businessId is always resolved from the auth token, never from the request body")
public class SpacesController {

    private final SpacesService spacesService;
    private final SecurityUtils securityUtils;

    /**
     * Upload an image.
     *
     * entityType: PRODUCT | CATEGORY | LOGO | BANNER | QR
     * entityId:   productId / categoryId / tableId  (omit for LOGO and BANNER)
     * variant:    SM | MD | LG | ORIGINAL           (omit to default to ORIGINAL)
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image to DigitalOcean Spaces")
    public ResponseEntity<SpacesUploadResponse> upload(
            @RequestPart("file") MultipartFile file,
            @RequestPart("entityType") String entityType,
            @RequestPart(value = "entityId", required = false) String entityId,
            @RequestPart(value = "variant", required = false) String variant
    ) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        SpacesUploadRequest request = SpacesUploadRequest.builder()
                .entityType(entityType)
                .entityId(entityId)
                .variant(variant)
                .build();
        return ResponseEntity.ok(spacesService.upload(file, request, businessId));
    }

    /**
     * Delete all image variants for a single entity (e.g. all sizes of one product).
     */
    @DeleteMapping("/entity")
    @Operation(summary = "Delete all images for a single entity")
    public ResponseEntity<Void> deleteEntity(
            @RequestParam String entityType,
            @RequestParam(required = false) String entityId
    ) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        spacesService.deleteByEntity(businessId, entityType, entityId);
        return ResponseEntity.noContent().build();
    }
}
