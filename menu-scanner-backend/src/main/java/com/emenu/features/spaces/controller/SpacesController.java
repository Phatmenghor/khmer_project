package com.emenu.features.spaces.controller;

import com.emenu.features.spaces.dto.response.SpacesImageResponse;
import com.emenu.features.spaces.dto.response.SpacesMultiUploadResponse;
import com.emenu.features.spaces.service.SpacesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/spaces")
@RequiredArgsConstructor
@Tag(name = "Spaces Storage", description = "Image upload / delete / log — proxied to Spaces microservice. No businessId needed.")
public class SpacesController {

    private final SpacesService spacesService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Unified image upload — returns both single-size and multi-size parameters")
    public ResponseEntity<SpacesMultiUploadResponse> upload(
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "path", required = false) String path,
            @RequestParam(value = "businessId", required = false) String businessId
    ) {
        String resolvedPath = (path != null && !path.isBlank()) ? path : businessId;
        return ResponseEntity.ok(spacesService.upload(file, resolvedPath));
    }

    @PostMapping(value = "/upload-multi", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Unified multi-size image upload — delegates to /upload")
    public ResponseEntity<SpacesMultiUploadResponse> uploadMulti(
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "path", required = false) String path,
            @RequestParam(value = "businessId", required = false) String businessId
    ) {
        String resolvedPath = (path != null && !path.isBlank()) ? path : businessId;
        return ResponseEntity.ok(spacesService.upload(file, resolvedPath));
    }

    @PostMapping(value = "/upload-multi-owner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image for owner — delegates to /upload with path owner")
    public ResponseEntity<SpacesMultiUploadResponse> uploadMultiOwner(
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(spacesService.upload(file, "owner"));
    }

    @PostMapping(value = "/upload-multi-customer", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image for customer — delegates to /upload with path customer")
    public ResponseEntity<SpacesMultiUploadResponse> uploadMultiCustomer(
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(spacesService.upload(file, "customer"));
    }

    /** Upload for a business. The API key registered for business scope is used automatically. */
    @PostMapping(value = "/business/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image for a business → sm / md / o variants")
    public ResponseEntity<SpacesMultiUploadResponse> uploadBusiness(
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(spacesService.upload(file, "business"));
    }

    /** Upload for owner scope. */
    @PostMapping(value = "/owner/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image for owner → sm / md / o variants")
    public ResponseEntity<SpacesMultiUploadResponse> uploadOwner(
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(spacesService.upload(file, "owner"));
    }

    /** Upload for customer scope. */
    @PostMapping(value = "/customer/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image for customer → sm / md / o variants")
    public ResponseEntity<SpacesMultiUploadResponse> uploadCustomer(
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(spacesService.upload(file, "customer"));
    }

    @DeleteMapping("/object")
    @Operation(summary = "Delete one image by its full storage key")
    public ResponseEntity<Void> deleteByKey(@RequestParam String key) {
        spacesService.deleteByKey(key);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/date")
    @Operation(summary = "Delete all images under a specific date prefix and path")
    public ResponseEntity<Void> deleteByDate(
            @RequestParam String date,
            @RequestParam(value = "path", required = false) String path,
            @RequestParam(value = "businessId", required = false) String businessId
    ) {
        String resolvedPath = (path != null && !path.isBlank()) ? path : businessId;
        spacesService.deleteByDate(date, resolvedPath);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/logs")
    @Operation(summary = "Get all image log entries for a path")
    public ResponseEntity<List<SpacesImageResponse>> getLogs(
            @RequestParam(value = "path", required = false) String path,
            @RequestParam(value = "businessId", required = false) String businessId
    ) {
        String resolvedPath = (path != null && !path.isBlank()) ? path : businessId;
        return ResponseEntity.ok(spacesService.getLogs(resolvedPath));
    }
}
