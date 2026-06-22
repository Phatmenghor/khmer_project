package com.emenu.features.spaces.controller;

import com.emenu.config.security.model.ApiKeyContext;
import com.emenu.features.spaces.dto.response.SpacesImageResponse;
import com.emenu.features.spaces.dto.response.SpacesMultiUploadResponse;
import com.emenu.features.spaces.service.SpacesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/spaces")
@RequiredArgsConstructor
@Tag(name = "Spaces Storage", description = "Image upload / delete / log — secured by API Key. No businessId or projectCode params needed; all context is resolved from the registered API key.")
public class SpacesController {

    private final SpacesService spacesService;

    /**
     * Upload a file.
     * <p>Generates sm / md / o (original) variants automatically.
     * Storage path is determined entirely by the API key:
     * <pre>
     *   {projectCode}/{path}/{yyyy-MM-dd}/{filename}
     * </pre>
     * Only send the file — no businessId, no project-code header required.
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image → sm / md / o variants. Path resolved from API key + optional custom path.")
    public ResponseEntity<SpacesMultiUploadResponse> upload(
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "path", required = false) String customPath,
            HttpServletRequest request
    ) {
        ApiKeyContext ctx = ctx(request);
        return ResponseEntity.ok(spacesService.upload(file, customPath, ctx));
    }

    @DeleteMapping("/object")
    @Operation(summary = "Delete one image by its full storage key")
    public ResponseEntity<Void> deleteByKey(@RequestParam String key) {
        spacesService.deleteByKey(key);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/date")
    @Operation(summary = "Delete all images under a specific date prefix, e.g. 2024-06-07")
    public ResponseEntity<Void> deleteByDate(
            @RequestParam String date,
            @RequestParam(value = "path", required = false) String customPath,
            HttpServletRequest request
    ) {
        spacesService.deleteByDate(date, customPath, ctx(request));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/logs")
    @Operation(summary = "Get all image log entries for this API key's project + optional custom path")
    public ResponseEntity<List<SpacesImageResponse>> getLogs(
            @RequestParam(value = "path", required = false) String customPath,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(spacesService.getLogs(customPath, ctx(request)));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private ApiKeyContext ctx(HttpServletRequest request) {
        return (ApiKeyContext) request.getAttribute(ApiKeyContext.REQUEST_ATTR);
    }
}
