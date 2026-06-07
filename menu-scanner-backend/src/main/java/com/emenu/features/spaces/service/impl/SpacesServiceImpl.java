package com.emenu.features.spaces.service.impl;

import com.emenu.config.spaces.SpacesProperties;
import com.emenu.features.spaces.dto.request.SpacesUploadRequest;
import com.emenu.features.spaces.dto.response.SpacesUploadResponse;
import com.emenu.features.spaces.enums.EntityType;
import com.emenu.features.spaces.enums.ImageVariant;
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

    @Override
    public SpacesUploadResponse upload(MultipartFile file, SpacesUploadRequest request, UUID businessId) {
        EntityType entityType = EntityType.valueOf(request.getEntityType().toUpperCase());
        ImageVariant variant = (request.getVariant() != null && !request.getVariant().isBlank())
                ? ImageVariant.valueOf(request.getVariant().toUpperCase())
                : ImageVariant.ORIGINAL;

        String key = StorageKeyUtil.buildKey(businessId, entityType, request.getEntityId(), variant);
        String contentType = file.getContentType() != null ? file.getContentType() : "image/webp";

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(spacesProperties.getBucket())
                    .key(key)
                    .contentType(contentType)
                    .contentLength(file.getSize())
                    .acl(ObjectCannedACL.PUBLIC_READ)
                    .build();

            spacesS3Client.putObject(putRequest, RequestBody.fromBytes(file.getBytes()));

            String url = spacesProperties.getCdnBaseUrl() + "/" + key;

            log.info("Uploaded {} {} to Spaces: {}", entityType, variant, key);

            return SpacesUploadResponse.builder()
                    .key(key)
                    .url(url)
                    .build();

        } catch (IOException e) {
            log.error("Failed to read upload bytes for key {}: {}", key, e.getMessage());
            throw new RuntimeException("Image upload failed: " + e.getMessage());
        }
    }

    @Override
    public void deleteByEntity(UUID businessId, String entityType, String entityId) {
        EntityType type = EntityType.valueOf(entityType.toUpperCase());
        String prefix = StorageKeyUtil.entityPrefix(businessId, type, entityId);

        if (type == EntityType.QR) {
            // QR key is an exact object key, not a prefix
            deleteObject(prefix);
        } else {
            deleteByPrefix(prefix);
        }

        log.info("Deleted Spaces objects for entity {} {} (business {})", type, entityId, businessId);
    }

    @Override
    public void deleteAllByBusiness(UUID businessId) {
        String prefix = StorageKeyUtil.businessPrefix(businessId);
        deleteByPrefix(prefix);
        log.info("Deleted all Spaces objects for business: {}", businessId);
    }

    // ── Internals ────────────────────────────────────────────────────────────────

    private void deleteByPrefix(String prefix) {
        List<ObjectIdentifier> toDelete = new ArrayList<>();

        ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                .bucket(spacesProperties.getBucket())
                .prefix(prefix)
                .build();

        ListObjectsV2Response page;
        do {
            page = spacesS3Client.listObjectsV2(listRequest);
            page.contents().forEach(obj ->
                    toDelete.add(ObjectIdentifier.builder().key(obj.key()).build())
            );
            listRequest = listRequest.toBuilder()
                    .continuationToken(page.nextContinuationToken())
                    .build();
        } while (Boolean.TRUE.equals(page.isTruncated()));

        if (toDelete.isEmpty()) {
            log.debug("No Spaces objects found for prefix: {}", prefix);
            return;
        }

        // S3 batch delete limit is 1 000 objects per request
        int batchSize = 1000;
        for (int i = 0; i < toDelete.size(); i += batchSize) {
            List<ObjectIdentifier> batch = toDelete.subList(i, Math.min(i + batchSize, toDelete.size()));
            spacesS3Client.deleteObjects(DeleteObjectsRequest.builder()
                    .bucket(spacesProperties.getBucket())
                    .delete(Delete.builder().objects(batch).build())
                    .build());
        }

        log.info("Deleted {} Spaces objects with prefix: {}", toDelete.size(), prefix);
    }

    private void deleteObject(String key) {
        spacesS3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(spacesProperties.getBucket())
                .key(key)
                .build());
        log.info("Deleted Spaces object: {}", key);
    }
}
