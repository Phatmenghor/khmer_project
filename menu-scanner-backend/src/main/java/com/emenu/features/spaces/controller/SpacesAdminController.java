package com.emenu.features.spaces.controller;

import com.emenu.features.spaces.service.SpacesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/spaces")
@RequiredArgsConstructor
@Tag(name = "Spaces Admin", description = "Bulk delete — subscription expiry / tenant cleanup")
public class SpacesAdminController {

    private final SpacesService spacesService;

    @DeleteMapping("/all")
    @Operation(summary = "Delete ALL images for a path scope")
    public ResponseEntity<Void> deleteAll(
            @RequestParam(value = "path", required = false) String path,
            @RequestParam(value = "businessId", required = false) String businessId
    ) {
        String resolvedPath = (path != null && !path.isBlank()) ? path : businessId;
        spacesService.deleteAll(resolvedPath);
        return ResponseEntity.noContent().build();
    }
}
