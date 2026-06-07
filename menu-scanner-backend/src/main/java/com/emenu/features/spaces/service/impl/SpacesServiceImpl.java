package com.emenu.features.spaces.service.impl;

import com.emenu.config.spaces.SpacesProperties;
import com.emenu.features.spaces.dto.response.SpacesUploadResponse;
import com.emenu.features.spaces.service.SpacesService;
import com.emenu.features.spaces.util.StorageKeyUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpacesServiceImpl implements SpacesService {

    private final S3Client spacesS3Client;
    private final SpacesProperties spacesProperties;

    // ── Upload ────────────────────────────────────────────────────────────────

    @Override
    public SpacesUploadResponse uploadProduct(MultipartFile file, UUID businessId, String productId, String variant) {
        String key = StorageKeyUtil.product(businessId, productId, variant);
        return put(file, key);
    }

    @Override
    public SpacesUploadResponse uploadCategory(MultipartFile file, UUID businessId, String categoryId) {
        String key = StorageKeyUtil.category(businessId, categoryId);
        return put(file, key);
    }

    @Override
    public SpacesUploadResponse uploadLogo(MultipartFile file, UUID businessId) {
        String key = StorageKeyUtil.logo(businessId);
        return put(file, key);
    }

    @Override
    public SpacesUploadResponse uploadBanner(MultipartFile file, UUID businessId) {
        String key = StorageKeyUtil.banner(businessId);
        return put(file, key);
    }

    @Override
    public SpacesUploadResponse uploadQr(MultipartFile file, UUID businessId, String tableId) {
        String key = StorageKeyUtil.qr(businessId, tableId);
        return put(file, key);
    }

    // ── Delete (entity) ───────────────────────────────────────────────────────

    @Override
    public void deleteProduct(UUID businessId, String productId) {
        deleteByPrefix(StorageKeyUtil.productPrefix(businessId, productId));
    }

    @Override
    public void deleteCategory(UUID businessId, String categoryId) {
        deleteByPrefix(StorageKeyUtil.categoryPrefix(businessId, categoryId));
    }

    @Override
    public void deleteLogo(UUID businessId) {
        deleteByPrefix(StorageKeyUtil.logoPrefix(businessId));
    }

    @Override
    public void deleteBanner(UUID businessId) {
        deleteByPrefix(StorageKeyUtil.bannerPrefix(businessId));
    }

    @Override
    public void deleteQr(UUID businessId, String tableId) {
        deleteObject(StorageKeyUtil.qr(businessId, tableId));
    }

    // ── Delete (business bulk) ────────────────────────────────────────────────

    @Override
    public void deleteAllByBusiness(UUID businessId) {
        deleteByPrefix(StorageKeyUtil.businessPrefix(businessId));
        log.info("Deleted all Spaces objects for business: {}", businessId);
    }

    // ── Internals ─────────────────────────────────────────────────────────────

    private SpacesUploadResponse put(MultipartFile file, String key) {
        String contentType = file.getContentType() != null ? file.getContentType() : "image/webp";
        try {
            spacesS3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(spacesProperties.getBucket())
                            .key(key)
                            .contentType(contentType)
                            .contentLength(file.getSize())
                            .acl(ObjectCannedACL.PUBLIC_READ)
                            .build(),
                    RequestBody.fromBytes(file.getBytes())
            );
        } catch (IOException e) {
            log.error("Upload failed for key {}: {}", key, e.getMessage());
            throw new RuntimeException("Image upload failed: " + e.getMessage());
        }

        String url = spacesProperties.getCdnBaseUrl() + "/" + key;
        log.info("Uploaded to Spaces: {}", key);
        return SpacesUploadResponse.builder().key(key).url(url).build();
    }

    private void deleteByPrefix(String prefix) {
        List<ObjectIdentifier> toDelete = new ArrayList<>();

        ListObjectsV2Request listReq = ListObjectsV2Request.builder()
                .bucket(spacesProperties.getBucket())
                .prefix(prefix)
                .build();

        ListObjectsV2Response page;
        do {
            page = spacesS3Client.listObjectsV2(listReq);
            page.contents().forEach(obj ->
                    toDelete.add(ObjectIdentifier.builder().key(obj.key()).build())
            );
            listReq = listReq.toBuilder().continuationToken(page.nextContinuationToken()).build();
        } while (Boolean.TRUE.equals(page.isTruncated()));

        if (toDelete.isEmpty()) return;

        // S3 batch delete limit = 1 000 objects per request
        for (int i = 0; i < toDelete.size(); i += 1000) {
            List<ObjectIdentifier> batch = toDelete.subList(i, Math.min(i + 1000, toDelete.size()));
            spacesS3Client.deleteObjects(DeleteObjectsRequest.builder()
                    .bucket(spacesProperties.getBucket())
                    .delete(Delete.builder().objects(batch).build())
                    .build());
        }

        log.info("Deleted {} objects with prefix: {}", toDelete.size(), prefix);
    }

    private void deleteObject(String key) {
        spacesS3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(spacesProperties.getBucket())
                .key(key)
                .build());
        log.info("Deleted Spaces object: {}", key);
    }
}
