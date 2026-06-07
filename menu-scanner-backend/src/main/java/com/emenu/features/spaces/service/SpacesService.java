package com.emenu.features.spaces.service;

import com.emenu.features.spaces.dto.response.SpacesUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface SpacesService {

    // ── Upload ────────────────────────────────────────────────────────────────
    SpacesUploadResponse uploadProduct(MultipartFile file, UUID businessId, String productId, String variant);
    SpacesUploadResponse uploadCategory(MultipartFile file, UUID businessId, String categoryId);
    SpacesUploadResponse uploadLogo(MultipartFile file, UUID businessId);
    SpacesUploadResponse uploadBanner(MultipartFile file, UUID businessId);
    SpacesUploadResponse uploadQr(MultipartFile file, UUID businessId, String tableId);

    // ── Delete (entity) ───────────────────────────────────────────────────────
    void deleteProduct(UUID businessId, String productId);
    void deleteCategory(UUID businessId, String categoryId);
    void deleteLogo(UUID businessId);
    void deleteBanner(UUID businessId);
    void deleteQr(UUID businessId, String tableId);

    // ── Delete (business bulk) ────────────────────────────────────────────────
    void deleteAllByBusiness(UUID businessId);
}
