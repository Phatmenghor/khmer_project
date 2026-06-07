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
@Tag(name = "Spaces Storage", description = "Image upload/delete — businessId always resolved from auth token")
public class SpacesController {

    private final SpacesService spacesService;
    private final SecurityUtils securityUtils;

    // ── Product ───────────────────────────────────────────────────────────────
    // variant: sm | md | lg | o  (default: o)

    @PostMapping(value = "/product/{productId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload product image — variant: sm | md | lg | o (default o)")
    public ResponseEntity<SpacesUploadResponse> uploadProduct(
            @PathVariable String productId,
            @RequestPart("file") MultipartFile file,
            @RequestParam(defaultValue = "o") String variant
    ) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        return ResponseEntity.ok(spacesService.uploadProduct(file, businessId, productId, variant));
    }

    @DeleteMapping("/product/{productId}")
    @Operation(summary = "Delete all variants of a product (sm + md + lg + o)")
    public ResponseEntity<Void> deleteProduct(@PathVariable String productId) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        spacesService.deleteProduct(businessId, productId);
        return ResponseEntity.noContent().build();
    }

    // ── Category ──────────────────────────────────────────────────────────────

    @PostMapping(value = "/category/{categoryId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload category image")
    public ResponseEntity<SpacesUploadResponse> uploadCategory(
            @PathVariable String categoryId,
            @RequestPart("file") MultipartFile file
    ) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        return ResponseEntity.ok(spacesService.uploadCategory(file, businessId, categoryId));
    }

    @DeleteMapping("/category/{categoryId}")
    @Operation(summary = "Delete category image")
    public ResponseEntity<Void> deleteCategory(@PathVariable String categoryId) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        spacesService.deleteCategory(businessId, categoryId);
        return ResponseEntity.noContent().build();
    }

    // ── Logo ──────────────────────────────────────────────────────────────────

    @PostMapping(value = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload business logo")
    public ResponseEntity<SpacesUploadResponse> uploadLogo(
            @RequestPart("file") MultipartFile file
    ) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        return ResponseEntity.ok(spacesService.uploadLogo(file, businessId));
    }

    @DeleteMapping("/logo")
    @Operation(summary = "Delete business logo")
    public ResponseEntity<Void> deleteLogo() {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        spacesService.deleteLogo(businessId);
        return ResponseEntity.noContent().build();
    }

    // ── Banner ────────────────────────────────────────────────────────────────

    @PostMapping(value = "/banner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload business banner")
    public ResponseEntity<SpacesUploadResponse> uploadBanner(
            @RequestPart("file") MultipartFile file
    ) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        return ResponseEntity.ok(spacesService.uploadBanner(file, businessId));
    }

    @DeleteMapping("/banner")
    @Operation(summary = "Delete business banner")
    public ResponseEntity<Void> deleteBanner() {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        spacesService.deleteBanner(businessId);
        return ResponseEntity.noContent().build();
    }

    // ── QR ───────────────────────────────────────────────────────────────────

    @PostMapping(value = "/qr/{tableId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload QR code for a table")
    public ResponseEntity<SpacesUploadResponse> uploadQr(
            @PathVariable String tableId,
            @RequestPart("file") MultipartFile file
    ) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        return ResponseEntity.ok(spacesService.uploadQr(file, businessId, tableId));
    }

    @DeleteMapping("/qr/{tableId}")
    @Operation(summary = "Delete QR code for a table")
    public ResponseEntity<Void> deleteQr(@PathVariable String tableId) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        spacesService.deleteQr(businessId, tableId);
        return ResponseEntity.noContent().build();
    }
}
