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

    @Override
    public SpacesUploadResponse upload(MultipartFile file, UUID businessId, String name) {
        String key = StorageKeyUtil.key(businessId, name);
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
        log.info("Uploaded: {}", key);
        return SpacesUploadResponse.builder().key(key).url(url).build();
    }

    @Override
    public void deleteByKey(UUID businessId, String key) {
        spacesS3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(spacesProperties.getBucket())
                .key(key)
                .build());
        log.info("Deleted: {}", key);
    }

    @Override
    public void deleteByYear(UUID businessId, int year) {
        deleteByPrefix(StorageKeyUtil.yearPrefix(businessId, year));
        log.info("Deleted year {} for business {}", year, businessId);
    }

    @Override
    public void deleteByMonth(UUID businessId, int year, int month) {
        deleteByPrefix(StorageKeyUtil.monthPrefix(businessId, year, month));
        log.info("Deleted {}/{} for business {}", year, month, businessId);
    }

    @Override
    public void deleteByDay(UUID businessId, int year, int month, int day) {
        deleteByPrefix(StorageKeyUtil.dayPrefix(businessId, year, month, day));
        log.info("Deleted {}/{}/{} for business {}", year, month, day, businessId);
    }

    @Override
    public void deleteAllByBusiness(UUID businessId) {
        deleteByPrefix(StorageKeyUtil.businessPrefix(businessId));
        log.info("Deleted all objects for business {}", businessId);
    }

    // ── Internal ──────────────────────────────────────────────────────────────

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

        for (int i = 0; i < toDelete.size(); i += 1000) {
            List<ObjectIdentifier> batch = toDelete.subList(i, Math.min(i + 1000, toDelete.size()));
            spacesS3Client.deleteObjects(DeleteObjectsRequest.builder()
                    .bucket(spacesProperties.getBucket())
                    .delete(Delete.builder().objects(batch).build())
                    .build());
        }

        log.info("Deleted {} objects with prefix: {}", toDelete.size(), prefix);
    }
}
