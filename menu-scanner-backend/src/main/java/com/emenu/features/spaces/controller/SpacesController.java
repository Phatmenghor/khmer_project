package com.emenu.features.spaces.controller;

import com.emenu.features.spaces.dto.response.SpacesImageResponse;
import com.emenu.features.spaces.dto.response.SpacesMultiUploadResponse;
import com.emenu.features.spaces.dto.response.SpacesUploadResponse;
import com.emenu.features.spaces.service.SpacesService;
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

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image — logged to DB with key and url")
    public ResponseEntity<SpacesUploadResponse> upload(
            @RequestPart("file") MultipartFile file,
            @RequestPart("businessId") String businessId
    ) {
        return ResponseEntity.ok(
                spacesService.upload(file, UUID.fromString(businessId))
        );
    }

    @PostMapping(value = "/upload-multi", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image — generates sm/md/lg/o sizes, returns all 4 keys and urls")
    public ResponseEntity<SpacesMultiUploadResponse> uploadMulti(
            @RequestPart("file") MultipartFile file,
            @RequestPart("businessId") String businessId
    ) {
        return ResponseEntity.ok(
                spacesService.uploadMulti(file, UUID.fromString(businessId))
        );
    }

    @PostMapping(value = "/upload-multi-owner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image for owner — stored under owner/yyyy-MM-dd/, no businessId needed")
    public ResponseEntity<SpacesMultiUploadResponse> uploadMultiOwner(
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(spacesService.uploadMultiOwner(file));
    }

    @DeleteMapping("/object")
    @Operation(summary = "Delete one image by key")
    public ResponseEntity<Void> deleteByKey(@RequestParam String key) {
        spacesService.deleteByKey(key);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/date")
    @Operation(summary = "Delete by date prefix — e.g. 2024-06-07")
    public ResponseEntity<Void> deleteByDate(
            @RequestParam String businessId,
            @RequestParam String prefix
    ) {
        spacesService.deleteByDate(UUID.fromString(businessId), prefix);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/logs/{businessId}")
    @Operation(summary = "Get all image logs for a business")
    public ResponseEntity<List<SpacesImageResponse>> getLogs(@PathVariable UUID businessId) {
        return ResponseEntity.ok(spacesService.getByBusiness(businessId));
    }
}
