package com.emenu.features.spaces.controller;

import com.emenu.config.security.model.ApiKeyContext;
import com.emenu.features.spaces.dto.response.SpacesMultiUploadResponse;
import com.emenu.features.spaces.service.SpacesService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/spaces")
@RequiredArgsConstructor
public class SpacesController {

    private final SpacesService spacesService;

    /**
     * Upload a file.
     * <p>Generates sm / md / o (original) variants automatically.
     * {@code pathStore} comes from the API key; the required {@code path}
     * request param ({@code customPath}) is appended after it:
     * <pre>
     *   {pathStore}/{customPath}/{yyyy-MM-dd}/{filename}
     * </pre>
     * No businessId, no project-code header required — only the file and path.
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SpacesMultiUploadResponse> upload(
            @RequestPart("file") MultipartFile file,
            @RequestParam("path") String customPath,
            HttpServletRequest request
    ) {
        ApiKeyContext ctx = ApiKeyContext.from(request);
        return ResponseEntity.ok(spacesService.upload(file, customPath, ctx));
    }
}
