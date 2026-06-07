package com.emenu.features.spaces.controller;

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
@Tag(name = "Spaces Storage", description = "businessId always resolved from auth token")
public class SpacesController {

    private final SpacesService spacesService;
    private final SecurityUtils securityUtils;

    /**
     * Upload any image.
     * path examples:
     *   p/{productId}/sm.webp
     *   c/{categoryId}/sm.webp
     *   logo/logo.webp
     *   banner/banner.webp
     *   qr/table-{tableId}.webp
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image — path decides where it lands under b/{businessId}/")
    public ResponseEntity<SpacesUploadResponse> upload(
            @RequestPart("file") MultipartFile file,
            @RequestPart("path") String path
    ) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        return ResponseEntity.ok(spacesService.upload(file, businessId, path));
    }

    /**
     * Delete by prefix.
     * prefix examples:
     *   p/{productId}/       → all product variants
     *   c/{categoryId}/      → category image
     *   logo/                → logo
     *   banner/              → banner
     *   qr/table-{tableId}.webp → one QR
     */
    @DeleteMapping
    @Operation(summary = "Delete by prefix under b/{businessId}/")
    public ResponseEntity<Void> delete(@RequestParam String prefix) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        spacesService.delete(businessId, prefix);
        return ResponseEntity.noContent().build();
    }
}
