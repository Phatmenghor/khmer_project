package com.emenu.features.spaces.controller;

import com.emenu.config.security.model.ApiKeyContext;
import com.emenu.features.spaces.service.SpacesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/spaces")
@RequiredArgsConstructor
public class SpacesAdminController {

    private final SpacesService spacesService;

    /**
     * Delete ALL objects stored under this API key's projectCode/path.
     * Typically called on subscription expiry or when a business/tenant is removed.
     */
    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAll(
            @RequestParam(value = "path", required = false) String customPath,
            HttpServletRequest request
    ) {
        spacesService.deleteAll(customPath, ApiKeyContext.from(request));
        return ResponseEntity.noContent().build();
    }
}
