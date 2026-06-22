package com.emenu.features.spaces.controller;

import com.emenu.features.spaces.dto.request.SpacesDeleteRequest;
import com.emenu.features.spaces.dto.response.SpacesDeleteResponse;
import com.emenu.features.spaces.service.SpacesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/spaces")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Spaces Admin", description = "Bulk delete — subscription expiry / tenant cleanup")
public class SpacesAdminController {

    private final SpacesService spacesService;

    @DeleteMapping("/all")
    @Operation(summary = "Delete ALL images under a path scope")
    public ResponseEntity<SpacesDeleteResponse> deleteAll(@Valid @RequestBody SpacesDeleteRequest request) {
        log.info("Delete-all requested: path=[{}]", request.getPath());
        SpacesDeleteResponse response = spacesService.deleteAll(request.getPath());
        log.info("Delete-all completed: path=[{}], deletedCount=[{}]", response.getPath(), response.getDeletedCount());
        return ResponseEntity.ok(response);
    }
}
