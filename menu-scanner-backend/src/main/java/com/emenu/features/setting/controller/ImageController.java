package com.emenu.features.setting.controller;

import com.emenu.features.setting.dto.response.ImageDto;
import com.emenu.features.setting.dto.response.ImageResponse;
import com.emenu.features.setting.dto.request.ImageUploadRequest;
import com.emenu.features.setting.service.ImageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/images")
@Slf4j
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    @PostMapping
    public ResponseEntity<ImageDto> uploadImage(@Valid @RequestBody ImageUploadRequest request) {
        ImageDto uploadedImage = imageService.uploadImage(request);
        return new ResponseEntity<>(uploadedImage, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getImageData(@PathVariable UUID id) {
        ImageResponse imageResponse = imageService.getImageById(id);
        return ResponseEntity
                .ok()
                .contentType(MediaType.valueOf(imageResponse.getType()))
                .header("Content-Disposition", "inline; filename=\"image\"")
                .header("Cache-Control", "public, max-age=86400")
                .header("Access-Control-Allow-Origin", "*")
                .body(imageResponse.getData());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImage(@PathVariable UUID id) {
        imageService.deleteImage(id);
        return ResponseEntity.noContent().build();
    }
}