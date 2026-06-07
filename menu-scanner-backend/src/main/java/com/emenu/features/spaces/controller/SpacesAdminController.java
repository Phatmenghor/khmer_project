package com.emenu.features.spaces.controller;

import com.emenu.features.spaces.service.SpacesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/spaces")
@RequiredArgsConstructor
@Tag(name = "Spaces Admin", description = "Admin-level bulk delete — subscription expiry and business cleanup")
public class SpacesAdminController {

    private final SpacesService spacesService;

    /**
     * Delete every object under b/{businessId}/.
     * Called on subscription expiry or when a business is deleted.
     */
    @DeleteMapping("/business/{businessId}")
    @Operation(summary = "Delete ALL images for a business (subscription expiry / business deletion)")
    public ResponseEntity<Void> deleteAllForBusiness(@PathVariable UUID businessId) {
        spacesService.deleteAllByBusiness(businessId);
        return ResponseEntity.noContent().build();
    }
}
