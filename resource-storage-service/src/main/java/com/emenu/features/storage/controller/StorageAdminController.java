package com.emenu.features.storage.controller;

import com.emenu.features.storage.dto.request.StorageDeleteRequest;
import com.emenu.features.storage.dto.response.StorageDeleteResponse;
import com.emenu.features.storage.service.StorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/storage")
@RequiredArgsConstructor
@Slf4j
public class StorageAdminController {

    private final StorageService storageService;

    @DeleteMapping("/all")
    public ResponseEntity<StorageDeleteResponse> deleteAll(@Valid @RequestBody StorageDeleteRequest request) {
        log.info("Delete-all requested: path=[{}]", request.getPath());
        StorageDeleteResponse response = storageService.deleteAll(request.getPath());
        log.info("Delete-all completed: path=[{}], deletedCount=[{}]", response.getPath(), response.getDeletedCount());
        return ResponseEntity.ok(response);
    }
}
